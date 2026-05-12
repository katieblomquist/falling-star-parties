import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { logger } from "@/lib/logger";
import { runFinalization, runFinalInvoice, runUpdate } from "@/lib/bookingActions";

// ---------------------------------------------------------------------------
// Internal auth verification
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
//
// Returns a streaming response so the Lambda stays alive while doing the work.
// The Slack actions handler awaits only the response *headers* (which arrive
// immediately once we enqueue the first chunk), then cancels the body and
// returns { ok: true } to Slack well within the 3-second window.
// This Lambda continues running — API Gateway does not cancel it when the
// client disconnects — and closes the stream when the work is complete.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<Response> {
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

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Enqueue immediately so the caller's `await fetch()` unblocks as soon
      // as the response headers + this first chunk arrive (~50ms intra-AWS).
      controller.enqueue(encoder.encode(JSON.stringify({ accepted: true })));

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
        } else {
          logger.warn("Background: unknown action", { action });
        }
      } catch (err) {
        logger.error("Background action failed", {
          action,
          notionPageId,
          errorMessage: err instanceof Error ? err.message : String(err),
        }, err);
      } finally {
        // Closing the stream allows the Lambda to terminate cleanly.
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
