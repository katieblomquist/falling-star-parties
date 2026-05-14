import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { logger } from "@/lib/logger";
import { runFinalization, runFinalInvoice, runUpdate, runPreEventReminder } from "@/lib/bookingActions";

// ---------------------------------------------------------------------------
// QStash signature verification
// ---------------------------------------------------------------------------

async function verifyQStashSignature(request: NextRequest, rawBody: string): Promise<boolean> {
  const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (!currentKey || !nextKey) {
    logger.error("Missing QSTASH signing keys");
    return false;
  }

  const receiver = new Receiver({ currentSigningKey: currentKey, nextSigningKey: nextKey });

  try {
    await receiver.verify({
      signature: request.headers.get("upstash-signature") ?? "",
      body: rawBody,
    });
    return true;
  } catch (err) {
    logger.warn("QStash signature verification failed", {
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

// ---------------------------------------------------------------------------
// Route handler
//
// Called by QStash as an independent HTTP request — no Slack timeout pressure.
// Simply runs the work and returns when done. QStash handles retries if we
// return a non-2xx status.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();

  if (!await verifyQStashSignature(request, rawBody)) {
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

  try {
    if (action === "retainer") {
      logger.info("Background: retainer finalization", { notionPageId });
      await runFinalization({ notionPageId, adminMessageTs, originalText });
    } else if (action === "update") {
      logger.info("Background: update booking", { notionPageId });
      await runUpdate({ notionPageId, adminMessageTs, originalText });
    } else if (action === "final-invoice") {
      logger.info("Background: final invoice", { notionPageId });
      await runFinalInvoice({ notionPageId, promptMessageTs, parentTs });
    } else if (action === "pre-event-reminder") {
      logger.info("Background: pre-event reminder", { notionPageId });
      await runPreEventReminder({ notionPageId });
    } else {
      logger.warn("Background: unknown action", { action });
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    logger.error("Background action failed", {
      action,
      notionPageId,
      errorMessage: err instanceof Error ? err.message : String(err),
    }, err);
    // Return 500 so QStash retries the job
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
