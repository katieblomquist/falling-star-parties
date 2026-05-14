import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { logger } from "@/lib/logger";
import { runFinalization, runFinalInvoice, runRetainerEmailOnly, runUpdate, runPreEventReminder } from "@/lib/bookingActions";

const UUID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

function verifySecret(provided: string): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: {
    action?: string;
    notionPageId?: string;
    secret?: string;
    // Optional Slack context — forwarded to run* functions so they can update
    // the Slack message on completion (only present when called from the Slack
    // actions handler, not when triggered manually).
    adminMessageTs?: string;
    originalText?: string;
    promptMessageTs?: string;
    parentTs?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, notionPageId, secret, adminMessageTs, originalText, promptMessageTs, parentTs } = body;

  // Auth
  if (!secret || !verifySecret(secret)) {
    logger.warn("Admin trigger: unauthorized attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate Notion page ID
  if (!notionPageId || !UUID_RE.test(notionPageId)) {
    return NextResponse.json({ error: "Invalid or missing notionPageId" }, { status: 400 });
  }

  if (action === "retainer") {
    logger.info("Admin trigger: retainer finalization", { notionPageId });
    const result = await runFinalization({ notionPageId, adminMessageTs, originalText });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      squareInvoiceUrl: result.squareInvoiceUrl,
      gmailDraftId: result.gmailDraftId,
    });
  }

  if (action === "update") {
    logger.info("Admin trigger: update booking", { notionPageId });
    const result = await runUpdate({ notionPageId, adminMessageTs, originalText });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, gmailDraftId: result.gmailDraftId });
  }

  if (action === "final-invoice") {
    logger.info("Admin trigger: final invoice", { notionPageId });
    const result = await runFinalInvoice({ notionPageId, promptMessageTs, parentTs });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      squareInvoiceUrl: result.squareInvoiceUrl,
      gmailDraftId: result.gmailDraftId,
    });
  }

  if (action === "retainer-email-only") {
    logger.info("Admin trigger: retainer email only", { notionPageId });
    const result = await runRetainerEmailOnly({ notionPageId });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      squareInvoiceUrl: result.squareInvoiceUrl,
      gmailDraftId: result.gmailDraftId,
    });
  }

  if (action === "pre-event-reminder") {
    logger.info("Admin trigger: pre-event reminder", { notionPageId });
    const result = await runPreEventReminder({ notionPageId });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, gmailDraftId: result.gmailDraftId });
  }

  return NextResponse.json({ error: "Unknown action. Use 'retainer', 'update', 'retainer-email-only', 'final-invoice', or 'pre-event-reminder'." }, { status: 400 });
}

