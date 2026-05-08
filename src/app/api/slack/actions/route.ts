import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { createHmac, timingSafeEqual } from "crypto";
import { Client } from "@notionhq/client";
import { logger } from "@/lib/logger";
import { renderPdfBuffer, notionPageToPdfData } from "@/app/api/generatePdf/route";
import { createRetainerInvoice } from "@/lib/squareService";
import { createFinalizationDraft } from "@/lib/gmailService";
import { markFinalizedInSlack } from "@/lib/slackService";

// ---------------------------------------------------------------------------
// Slack signature verification
// ---------------------------------------------------------------------------

async function verifySlackSignature(request: NextRequest, rawBody: string): Promise<boolean> {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const timestamp = request.headers.get("x-slack-request-timestamp");
  const slackSignature = request.headers.get("x-slack-signature");
  if (!timestamp || !slackSignature) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const sigBase = `v0:${timestamp}:${rawBody}`;
  const hmac = createHmac("sha256", signingSecret).update(sigBase).digest("hex");
  const computedSig = `v0=${hmac}`;

  try {
    return timingSafeEqual(Buffer.from(computedSig), Buffer.from(slackSignature));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();

  // Verify Slack signature
  const valid = await verifySlackSignature(request, rawBody);
  if (!valid) {
    logger.warn("Invalid Slack signature on actions endpoint");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse Slack's URL-encoded payload
  const params = new URLSearchParams(rawBody);
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(params.get("payload") ?? "{}");
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const actions = payload.actions as Array<Record<string, unknown>> | undefined;
  const action = actions?.[0];
  if (action?.action_id !== "finalize_booking" && action?.action_id !== "update_booking") {
    return NextResponse.json({ ok: true });
  }

  const notionPageId = action.value as string;
  const message = payload.message as Record<string, unknown> | undefined;
  const adminMessageTs = message?.ts as string | undefined;

  // Extract the original text from the message to preserve it on update
  const messageBlocks = message?.blocks as Array<Record<string, unknown>> | undefined;
  const originalText =
    (messageBlocks?.[0]?.text as Record<string, unknown>)?.text as string ?? "";

  // Acknowledge immediately (Slack requires < 3s response)
  // We'll do the work asynchronously and update the message when done.
  if (action.action_id === "update_booking") {
    waitUntil(runUpdate({ notionPageId, adminMessageTs, originalText }));
  } else {
    waitUntil(runFinalization({ notionPageId, adminMessageTs, originalText }));
  }

  return NextResponse.json({ ok: true });
}

// ---------------------------------------------------------------------------
// Finalization logic (runs after Slack ack)
// ---------------------------------------------------------------------------

async function runFinalization(opts: {
  notionPageId: string;
  adminMessageTs: string | undefined;
  originalText: string;
}) {
  const { notionPageId, adminMessageTs, originalText } = opts;

  const notionKey = process.env.NOTION_KEY;
  if (!notionKey) {
    logger.error("Missing NOTION_KEY in finalization", { notionPageId });
    return;
  }

  try {
    const notion = new Client({ auth: notionKey });

    // 1. Fetch Notion page
    const page = await notion.pages.retrieve({ page_id: notionPageId });
    const data = notionPageToPdfData(page);

    logger.info("Starting finalization", { notionPageId, clientEmail: data.clientEmail });

    // 2. Generate PDF + create Square invoice in parallel
    const [pdfBuffer, squareResult] = await Promise.all([
      renderPdfBuffer(data),
      createRetainerInvoice(data.clientFirstName, data.clientLastName, data.clientEmail),
    ]);

    // 3. Create Gmail draft
    const gmailResult = await createFinalizationDraft({
      clientEmail: data.clientEmail,
      clientFirstName: data.clientFirstName,
      clientLastName: data.clientLastName,
      eventDate: data.dateTime,
      pdfBuffer,
      squareInvoiceUrl: squareResult.invoiceUrl,
    });

    // 4. Append finalization note to Notion page
    await notion.blocks.children.append({
      block_id: notionPageId,
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: `Finalization triggered — ${new Date().toLocaleString("en-US", {
                    timeZone: "America/New_York",
                  })} | Square Invoice: ${squareResult.invoiceUrl} | Gmail Draft: ${gmailResult.draftId}`,
                },
              },
            ],
          },
        },
      ],
    });

    // 5. Update admin Slack message
    if (adminMessageTs) {
      await markFinalizedInSlack(adminMessageTs, originalText, notionPageId);
    }

    logger.info("Finalization complete", {
      notionPageId,
      squareInvoiceId: squareResult.invoiceId,
      gmailDraftId: gmailResult.draftId,
    });
  } catch (err) {
    logger.error("Finalization failed", {
      notionPageId,
      errorMessage: err instanceof Error ? err.message : String(err),
    }, err);

    // Update admin message to show failure
    if (adminMessageTs) {
      try {
        const { WebClient } = await import("@slack/web-api");
        const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
        const adminChannelId = process.env.SLACK_ADMIN_CHANNEL_ID;
        if (adminChannelId) {
          await slack.chat.postMessage({
            channel: adminChannelId,
            thread_ts: adminMessageTs,
            text: `⚠️ Finalization failed: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
      } catch {
        // best effort
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Update logic — regenerates PDF + Gmail draft only (no new Square invoice)
// ---------------------------------------------------------------------------

/** Reads Notion block children to find the Square invoice URL from the most
 *  recent finalization note, so we can reuse it in the updated Gmail draft. */
async function getSquareInvoiceUrlFromNotion(
  notion: Client,
  notionPageId: string
): Promise<string | undefined> {
  try {
    const blocks = await notion.blocks.children.list({ block_id: notionPageId });
    // Walk in reverse to find the most recent finalization note
    for (const block of [...blocks.results].reverse()) {
      if (!("type" in block) || block.type !== "paragraph") continue;
      const texts = (block as { type: "paragraph"; paragraph: { rich_text: Array<{ plain_text: string }> } }).paragraph.rich_text;
      const content = texts.map((t) => t.plain_text).join("");
      const match = content.match(/Square Invoice: (https?:\/\/\S+)/);
      if (match) return match[1];
    }
  } catch {
    // best effort
  }
  return undefined;
}

async function runUpdate(opts: {
  notionPageId: string;
  adminMessageTs: string | undefined;
  originalText: string;
}) {
  const { notionPageId, adminMessageTs, originalText } = opts;

  const notionKey = process.env.NOTION_KEY;
  if (!notionKey) {
    logger.error("Missing NOTION_KEY in update", { notionPageId });
    return;
  }

  try {
    const notion = new Client({ auth: notionKey });

    const page = await notion.pages.retrieve({ page_id: notionPageId });
    const data = notionPageToPdfData(page);

    logger.info("Starting update (PDF + Gmail draft only)", { notionPageId, clientEmail: data.clientEmail });

    // Re-use the existing Square invoice URL from the original finalization note.
    const squareInvoiceUrl =
      (await getSquareInvoiceUrlFromNotion(notion, notionPageId)) ??
      process.env.SQUARE_DASHBOARD_URL ??
      "https://squareup.com/dashboard/invoices";

    const pdfBuffer = await renderPdfBuffer(data);

    const gmailResult = await createFinalizationDraft({
      clientEmail: data.clientEmail,
      clientFirstName: data.clientFirstName,
      clientLastName: data.clientLastName,
      eventDate: data.dateTime,
      pdfBuffer,
      squareInvoiceUrl,
    });

    await notion.blocks.children.append({
      block_id: notionPageId,
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: `Update triggered — ${new Date().toLocaleString("en-US", {
                    timeZone: "America/New_York",
                  })} | Gmail Draft: ${gmailResult.draftId}`,
                },
              },
            ],
          },
        },
      ],
    });

    if (adminMessageTs) {
      await markFinalizedInSlack(adminMessageTs, originalText, notionPageId);
    }

    logger.info("Update complete", { notionPageId, gmailDraftId: gmailResult.draftId });
  } catch (err) {
    logger.error("Update failed", {
      notionPageId,
      errorMessage: err instanceof Error ? err.message : String(err),
    }, err);

    if (adminMessageTs) {
      try {
        const { WebClient } = await import("@slack/web-api");
        const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
        const adminChannelId = process.env.SLACK_ADMIN_CHANNEL_ID;
        if (adminChannelId) {
          await slack.chat.postMessage({
            channel: adminChannelId,
            thread_ts: adminMessageTs,
            text: `⚠️ Update failed: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
      } catch {
        // best effort
      }
    }
  }
}
