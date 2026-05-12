import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { logger } from "@/lib/logger";
import { runFinalization, runFinalInvoice, runUpdate } from "@/lib/bookingActions";

// ---------------------------------------------------------------------------
// Internal auth verification
//
// Requests must include an X-Internal-Signature header containing an HMAC-SHA256
// of the raw JSON body, signed with SLACK_SIGNING_SECRET. This secret is already
// proven to be available in the Lambda runtime (Slack signature verification works),
// so we reuse it here rather than adding a new env var.
// ---------------------------------------------------------------------------

function verifyInternalSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret || !signature) return false;
  try {
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();
  const signature = request.headers.get("x-internal-signature");

  if (!verifyInternalSignature(rawBody, signature)) {
    logger.warn("Invalid internal signature on background endpoint");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, notionPageId, adminMessageTs, originalText, promptMessageTs, parentTs } = body as {
    action?: string;
    notionPageId?: string;
    adminMessageTs?: string;
    originalText?: string;
    promptMessageTs?: string;
    parentTs?: string;
  };

  const UUID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  if (!notionPageId || !UUID_RE.test(notionPageId)) {
    return NextResponse.json({ error: "Invalid or missing notionPageId" }, { status: 400 });
  }

  if (action === "retainer") {
    logger.info("Background: retainer finalization", { notionPageId });
    const result = await runFinalization({ notionPageId, adminMessageTs, originalText });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true, squareInvoiceUrl: result.squareInvoiceUrl, gmailDraftId: result.gmailDraftId });
  }

  if (action === "update") {
    logger.info("Background: update booking", { notionPageId });
    const result = await runUpdate({ notionPageId, adminMessageTs, originalText });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true, gmailDraftId: result.gmailDraftId });
  }

  if (action === "final-invoice") {
    logger.info("Background: final invoice", { notionPageId });
    const result = await runFinalInvoice({ notionPageId, promptMessageTs, parentTs });
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json({ ok: true, squareInvoiceUrl: result.squareInvoiceUrl, gmailDraftId: result.gmailDraftId });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
