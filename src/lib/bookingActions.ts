/**
 * Shared booking action logic used by both the Slack actions handler and
 * the manual admin trigger endpoint. All Slack-specific params are optional —
 * when omitted the functions simply skip the Slack update steps.
 */

import { Client } from "@notionhq/client";
import { logger } from "@/lib/logger";
import { renderPdfBuffer, notionPageToPdfData } from "@/app/api/generatePdf/route";
import { createRetainerInvoice, createFinalInvoice } from "@/lib/squareService";
import { createFinalizationDraft, createFinalInvoiceDraft } from "@/lib/gmailService";
import { markFinalizedInSlack, markFinalInvoiceSent } from "@/lib/slackService";
import { createBookingCalendarEvent } from "@/lib/googleCalendarService";

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

export interface ActionResult {
  success: boolean;
  squareInvoiceUrl?: string;
  gmailDraftId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// runFinalization — Square retainer invoice + finalization PDF + Gmail draft
// ---------------------------------------------------------------------------

export async function runFinalization(opts: {
  notionPageId: string;
  /** Slack ts of the admin message to update on success (optional). */
  adminMessageTs?: string;
  /** Original Slack message text to preserve on update (optional). */
  originalText?: string;
}): Promise<ActionResult> {
  const { notionPageId, adminMessageTs, originalText = "" } = opts;

  const notionKey = process.env.NOTION_KEY;
  if (!notionKey) {
    logger.error("Missing NOTION_KEY in runFinalization", { notionPageId });
    return { success: false, error: "Server configuration error: missing NOTION_KEY" };
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

    // 4. Update Notion page
    await Promise.all([
      notion.pages.update({
        page_id: notionPageId,
        properties: {
          "Retainer Invoice": { url: squareResult.invoiceUrl },
          "Square Retainer Invoice ID": {
            rich_text: [{ text: { content: squareResult.invoiceId } }],
          },
        },
      }),
      notion.blocks.children.append({
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
      }),
    ]);

    // 5. Update Slack admin message (if triggered from Slack)
    if (adminMessageTs) {
      await markFinalizedInSlack(adminMessageTs, originalText, notionPageId);
    }

    logger.info("Finalization complete", {
      notionPageId,
      squareInvoiceId: squareResult.invoiceId,
      gmailDraftId: gmailResult.draftId,
    });

    return {
      success: true,
      squareInvoiceUrl: squareResult.invoiceUrl,
      gmailDraftId: gmailResult.draftId,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error("Finalization failed", { notionPageId, errorMessage: error }, err);

    // Notify via Slack thread if we have context
    if (adminMessageTs) {
      try {
        const { WebClient } = await import("@slack/web-api");
        const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
        const adminChannelId = process.env.SLACK_ADMIN_CHANNEL_ID;
        if (adminChannelId) {
          await slack.chat.postMessage({
            channel: adminChannelId,
            thread_ts: adminMessageTs,
            text: `⚠️ Finalization failed: ${error}`,
          });
        }
      } catch {
        // best effort
      }
    }

    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// runFinalInvoice — Square final invoice + Gmail draft
// ---------------------------------------------------------------------------

export async function runFinalInvoice(opts: {
  notionPageId: string;
  /** Slack ts of the thread reply prompt to update on success (optional). */
  promptMessageTs?: string;
  /** Slack ts of the top-level admin message / thread parent (optional). */
  parentTs?: string;
}): Promise<ActionResult> {
  const { notionPageId, promptMessageTs, parentTs } = opts;

  const notionKey = process.env.NOTION_KEY;
  if (!notionKey) {
    logger.error("Missing NOTION_KEY in runFinalInvoice", { notionPageId });
    return { success: false, error: "Server configuration error: missing NOTION_KEY" };
  }

  try {
    const notion = new Client({ auth: notionKey });

    // 1. Fetch Notion page
    const page = await notion.pages.retrieve({ page_id: notionPageId });
    const data = notionPageToPdfData(page);

    logger.info("Starting final invoice flow", { notionPageId, clientEmail: data.clientEmail });

    // 2. Generate PDF while Square invoice is being created
    const pdfBuffer = await renderPdfBuffer(data);

    // 3. Create Square final invoice
    const squareResult = await createFinalInvoice(data, data.clientEmail, data.dateTime);

    // 4. Create Gmail draft with final invoice link
    const gmailResult = await createFinalInvoiceDraft({
      clientEmail: data.clientEmail,
      clientFirstName: data.clientFirstName,
      clientLastName: data.clientLastName,
      eventDate: data.dateTime,
      pdfBuffer,
      squareInvoiceUrl: squareResult.invoiceUrl,
    });

    // 5. Update Notion with final invoice details + create Google Calendar event in parallel
    const [, calendarResult] = await Promise.all([
      Promise.all([
        notion.pages.update({
          page_id: notionPageId,
          properties: {
            "Final Invoice": { url: squareResult.invoiceUrl },
            "Final Invoice ID": { rich_text: [{ text: { content: squareResult.invoiceId } }] },
          },
        }),
        notion.blocks.children.append({
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
                      content: `Final invoice sent — ${new Date().toLocaleString("en-US", {
                        timeZone: "America/New_York",
                      })} | Square Invoice: ${squareResult.invoiceUrl} | Gmail Draft: ${gmailResult.draftId}`,
                    },
                  },
                ],
              },
            },
          ],
        }),
      ]),
      createBookingCalendarEvent(data).catch((err) => {
        // Calendar creation is non-blocking — log the error but don't fail the invoice flow
        logger.error("Google Calendar event creation failed (non-fatal)", { notionPageId }, err);
        return null;
      }),
    ]);

    // 6. Update Slack thread reply (if triggered from Slack)
    if (promptMessageTs) {
      const adminChannelId = process.env.SLACK_ADMIN_CHANNEL_ID;
      if (adminChannelId) {
        await markFinalInvoiceSent(adminChannelId, parentTs ?? promptMessageTs, promptMessageTs);
      }
    }

    logger.info("Final invoice flow complete", {
      notionPageId,
      squareInvoiceId: squareResult.invoiceId,
      gmailDraftId: gmailResult.draftId,
      calendarEventId: calendarResult?.eventId ?? "not created",
    });

    return {
      success: true,
      squareInvoiceUrl: squareResult.invoiceUrl,
      gmailDraftId: gmailResult.draftId,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error("Final invoice flow failed", { notionPageId, errorMessage: error }, err);

    // Post error to Slack thread if we have context
    if (promptMessageTs || parentTs) {
      try {
        const { WebClient } = await import("@slack/web-api");
        const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
        const adminChannelId = process.env.SLACK_ADMIN_CHANNEL_ID;
        if (adminChannelId) {
          await slack.chat.postMessage({
            channel: adminChannelId,
            thread_ts: parentTs ?? promptMessageTs,
            text: `⚠️ Final invoice failed: ${error}`,
          });
        }
      } catch {
        // best effort
      }
    }

    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// runUpdate — regenerates PDF + Gmail draft only, reuses existing Square invoice
// (no new invoice created — used when booking details change after finalization)
// ---------------------------------------------------------------------------

export async function runUpdate(opts: {
  notionPageId: string;
  /** Slack ts of the admin message to update on success (optional). */
  adminMessageTs?: string;
  /** Original Slack message text to preserve on update (optional). */
  originalText?: string;
}): Promise<ActionResult> {
  const { notionPageId, adminMessageTs, originalText = "" } = opts;

  const notionKey = process.env.NOTION_KEY;
  if (!notionKey) {
    logger.error("Missing NOTION_KEY in runUpdate", { notionPageId });
    return { success: false, error: "Server configuration error: missing NOTION_KEY" };
  }

  try {
    const notion = new Client({ auth: notionKey });

    // 1. Fetch Notion page
    const page = await notion.pages.retrieve({ page_id: notionPageId });
    const data = notionPageToPdfData(page);

    logger.info("Starting update (PDF + Gmail draft only)", { notionPageId, clientEmail: data.clientEmail });

    // 2. Read the existing Square invoice URL from Notion
    const props = (page as Record<string, unknown>).properties as Record<string, unknown>;
    const retainerProp = props["Retainer Invoice"] as { url?: string | null } | undefined;
    const squareInvoiceUrl =
      retainerProp?.url ??
      process.env.SQUARE_DASHBOARD_URL ??
      "https://squareup.com/dashboard/invoices";

    // 3. Generate PDF + create Gmail draft
    const pdfBuffer = await renderPdfBuffer(data);

    const gmailResult = await createFinalizationDraft({
      clientEmail: data.clientEmail,
      clientFirstName: data.clientFirstName,
      clientLastName: data.clientLastName,
      eventDate: data.dateTime,
      pdfBuffer,
      squareInvoiceUrl,
    });

    // 4. Append audit log to Notion
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

    // 5. Update Slack admin message (if triggered from Slack)
    if (adminMessageTs) {
      await markFinalizedInSlack(adminMessageTs, originalText, notionPageId);
    }

    logger.info("Update complete", { notionPageId, gmailDraftId: gmailResult.draftId });

    return { success: true, gmailDraftId: gmailResult.draftId };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error("Update failed", { notionPageId, errorMessage: error }, err);

    if (adminMessageTs) {
      try {
        const { WebClient } = await import("@slack/web-api");
        const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
        const adminChannelId = process.env.SLACK_ADMIN_CHANNEL_ID;
        if (adminChannelId) {
          await slack.chat.postMessage({
            channel: adminChannelId,
            thread_ts: adminMessageTs,
            text: `⚠️ Update failed: ${error}`,
          });
        }
      } catch {
        // best effort
      }
    }

    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// runRetainerEmailOnly — regenerates PDF + Gmail draft, reuses existing Square
// invoice URL from the Notion "Retainer Invoice" property (no new invoice)
// ---------------------------------------------------------------------------

export async function runRetainerEmailOnly(opts: {
  notionPageId: string;
  adminMessageTs?: string;
  originalText?: string;
}): Promise<ActionResult> {
  const { notionPageId, adminMessageTs, originalText = "" } = opts;

  const notionKey = process.env.NOTION_KEY;
  if (!notionKey) {
    logger.error("Missing NOTION_KEY in runRetainerEmailOnly", { notionPageId });
    return { success: false, error: "Server configuration error: missing NOTION_KEY" };
  }

  try {
    const notion = new Client({ auth: notionKey });

    const page = await notion.pages.retrieve({ page_id: notionPageId });
    const data = notionPageToPdfData(page);

    logger.info("Starting retainer email-only update", { notionPageId, clientEmail: data.clientEmail });

    // Read the existing Square invoice URL from the Notion property
    const props = (page as Record<string, unknown>).properties as Record<string, unknown>;
    const retainerProp = props["Retainer Invoice"] as { url?: string | null } | undefined;
    const squareInvoiceUrl =
      retainerProp?.url ??
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
                  content: `Retainer email re-sent (PDF only) — ${new Date().toLocaleString("en-US", {
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

    logger.info("Retainer email-only update complete", {
      notionPageId,
      gmailDraftId: gmailResult.draftId,
      squareInvoiceUrl,
    });

    return { success: true, squareInvoiceUrl, gmailDraftId: gmailResult.draftId };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.error("Retainer email-only update failed", { notionPageId, errorMessage: error }, err);
    return { success: false, error };
  }
}
