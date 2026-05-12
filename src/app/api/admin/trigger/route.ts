import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { logger } from "@/lib/logger";
import { runFinalization, runFinalInvoice, runRetainerEmailOnly } from "@/lib/bookingActions";

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
  let body: { action?: string; notionPageId?: string; secret?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, notionPageId, secret } = body;

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
    const result = await runFinalization({ notionPageId });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      squareInvoiceUrl: result.squareInvoiceUrl,
      gmailDraftId: result.gmailDraftId,
    });
  }

  if (action === "final-invoice") {
    logger.info("Admin trigger: final invoice", { notionPageId });
    const result = await runFinalInvoice({ notionPageId });
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

  return NextResponse.json({ error: "Unknown action. Use 'retainer', 'retainer-email-only', or 'final-invoice'." }, { status: 400 });
}

