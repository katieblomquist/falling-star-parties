import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { logger } from "@/lib/logger";

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
// Fire-and-forget helper
//
// Fires a POST to /api/slack/background which runs in its own Lambda invocation,
// completely independent of this one. The request is signed with
// SLACK_SIGNING_SECRET (already proven available in production). We await with
// a short abort timeout — just long enough to ensure the HTTP request has been
// transmitted (~50ms intra-AWS) — then return to Slack well within its 3-second
// window. The receiving Lambda continues running to completion regardless.
// ---------------------------------------------------------------------------

async function dispatchToBackground(
  baseUrl: string,
  body: Record<string, unknown>
): Promise<void> {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) {
    logger.error("Missing SLACK_SIGNING_SECRET — cannot dispatch background action");
    return;
  }

  const payload = JSON.stringify(body);
  const signature = createHmac("sha256", secret).update(payload).digest("hex");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 500);

  try {
    await fetch(`${baseUrl}/api/slack/background`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-signature": signature,
      },
      body: payload,
      signal: controller.signal,
    });
  } catch {
    // AbortError is expected — the request was sent, we just stopped waiting.
  } finally {
    clearTimeout(timeout);
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
  if (
    action?.action_id !== "finalize_booking" &&
    action?.action_id !== "update_booking" &&
    action?.action_id !== "send_final_invoice"
  ) {
    return NextResponse.json({ ok: true });
  }

  const notionPageId = action.value as string;

  // Validate that the page ID is a UUID before passing to Notion
  const UUID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  if (!notionPageId || !UUID_RE.test(notionPageId)) {
    logger.warn("Invalid notionPageId in Slack action payload", { notionPageId });
    return NextResponse.json({ error: "Invalid page ID" }, { status: 400 });
  }

  const message = payload.message as Record<string, unknown> | undefined;
  const adminMessageTs = message?.ts as string | undefined;
  const messageBlocks = message?.blocks as Array<Record<string, unknown>> | undefined;
  const originalText =
    (messageBlocks?.[0]?.text as Record<string, unknown>)?.text as string ?? "";

  // Derive base URL from the incoming request so this works in any environment.
  const { protocol, host } = new URL(request.url);
  const baseUrl = `${protocol}//${host}`;

  // Dispatch background work to /api/admin/trigger (its own Lambda invocation).
  // We acknowledge Slack immediately — the trigger endpoint handles all the
  // heavy lifting (Notion, Square, Gmail) and updates the Slack message itself.
  if (action.action_id === "update_booking") {
    await dispatchToBackground(baseUrl, {
      action: "update",
      notionPageId,
      adminMessageTs,
      originalText,
    });
  } else if (action.action_id === "send_final_invoice") {
    const promptMessageTs = adminMessageTs;
    const parentTs = message?.thread_ts as string | undefined;
    await dispatchToBackground(baseUrl, {
      action: "final-invoice",
      notionPageId,
      promptMessageTs,
      parentTs,
    });
  } else {
    await dispatchToBackground(baseUrl, {
      action: "retainer",
      notionPageId,
      adminMessageTs,
      originalText,
    });
  }

  return NextResponse.json({ ok: true });
}
