import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { Client } from "@notionhq/client";
import { logger } from "@/lib/logger";
import { postFinalInvoicePrompt } from "@/lib/slackService";

// ---------------------------------------------------------------------------
// Square webhook signature verification
// Square signs the raw body with HMAC-SHA256 using the webhook signature key.
// The signature is in the "x-square-hmacsha256-signature" header.
// ---------------------------------------------------------------------------

function verifySquareSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookUrl: string
): boolean {
  const signingKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!signingKey || !signatureHeader) return false;

  // Square computes: HMAC-SHA256(signingKey, webhookUrl + rawBody)
  const payload = webhookUrl + rawBody;
  const hmac = createHmac("sha256", signingKey).update(payload).digest("base64");

  try {
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();

  // Reconstruct the full webhook URL (Square requires this for signature verification)
  const webhookUrl =
    process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/square/webhook`
      : `https://fallingstarparties.com/api/square/webhook`;

  const signatureHeader = request.headers.get("x-square-hmacsha256-signature");
  const isValid = verifySquareSignature(rawBody, signatureHeader, webhookUrl);

  if (!isValid) {
    logger.warn("Square webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: Record<string, any>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Respond immediately — Square expects a 200 quickly
  // Only handle invoice.payment_made
  if (event.type !== "invoice.payment_made") {
    return NextResponse.json({ ok: true });
  }

  logger.info("Square webhook: invoice.payment_made received", {
    eventId: event.event_id,
  });

  // Run the rest asynchronously so we don't block the response
  handleRetainerPaid(event).catch((err) => {
    logger.error("Square webhook: handleRetainerPaid threw", {
      errorMessage: err instanceof Error ? err.message : String(err),
    }, err);
  });

  return NextResponse.json({ ok: true });
}

// ---------------------------------------------------------------------------
// Core logic — find booking in Notion and post Slack prompt
// ---------------------------------------------------------------------------

async function handleRetainerPaid(event: Record<string, any>): Promise<void> {
  const invoiceId: string | undefined = event.data?.object?.invoice?.id;
  if (!invoiceId) {
    logger.warn("Square webhook: no invoice ID in payload");
    return;
  }

  const notionKey = process.env.NOTION_KEY;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;
  const adminChannelId = process.env.SLACK_ADMIN_CHANNEL_ID;

  if (!notionKey || !notionDatabaseId || !adminChannelId) {
    logger.error("Square webhook: missing env vars", { notionKey: !!notionKey, notionDatabaseId: !!notionDatabaseId, adminChannelId: !!adminChannelId });
    return;
  }

  const notion = new Client({ auth: notionKey });

  // Query Notion for the booking with matching Square Retainer Invoice ID
  const queryResult = await notion.databases.query({
    database_id: notionDatabaseId,
    filter: {
      property: "Square Retainer Invoice ID",
      rich_text: {
        equals: invoiceId,
      },
    },
  });

  if (!queryResult.results.length) {
    logger.warn("Square webhook: no Notion page found for invoice ID", { invoiceId });
    return;
  }

  const page = queryResult.results[0] as any;
  const pageId: string = page.id;
  const props = page.properties;

  // Read the admin Slack timestamp
  const adminTs: string | undefined =
    props["Slack Admin TS"]?.rich_text?.[0]?.plain_text || undefined;

  if (!adminTs) {
    logger.warn("Square webhook: no Slack Admin TS on Notion page", { pageId });
    return;
  }

  // Mark retainer as paid in Notion
  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Retainer Paid": { checkbox: true },
    },
  });

  logger.info("Square webhook: marked retainer paid in Notion", { pageId });

  // Post the final invoice prompt to Slack admin thread
  await postFinalInvoicePrompt(adminChannelId, adminTs, pageId);

  logger.info("Square webhook: posted final invoice prompt to Slack", { pageId, adminTs });
}
