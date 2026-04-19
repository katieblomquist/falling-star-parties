import { NextRequest, NextResponse } from "next/server";
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
  if (action?.action_id !== "finalize_booking") {
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
  void runFinalization({
    notionPageId,
    adminMessageTs,
    originalText,
    request,
  });

  return NextResponse.json({ ok: true });
}

// ---------------------------------------------------------------------------
// Finalization logic (runs after Slack ack)
// ---------------------------------------------------------------------------

async function runFinalization(opts: {
  notionPageId: string;
  adminMessageTs: string | undefined;
  originalText: string;
  request: NextRequest;
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

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      `https://${opts.request.headers.get("host")}`;

    logger.info("Starting finalization", { notionPageId, clientEmail: data.clientEmail });

    // 2. Generate PDF + create Square invoice in parallel
    const [pdfBuffer, squareResult] = await Promise.all([
      renderPdfBuffer(data, baseUrl),
      createRetainerInvoice(data.clientFirstName, data.clientFirstName, data.clientEmail),
    ]);

    // 3. Create Gmail draft
    const gmailResult = await createFinalizationDraft({
      clientEmail: data.clientEmail,
      clientFirstName: data.clientFirstName,
      pdfBuffer,
      squareInvoiceUrl: squareResult.invoiceUrl,
      baseUrl,
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
      await markFinalizedInSlack(adminMessageTs, originalText);
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
