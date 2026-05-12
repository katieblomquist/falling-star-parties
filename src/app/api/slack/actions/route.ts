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
// Fires a POST to /api/admin/trigger which runs in its own Lambda invocation,
// completely independent of this one. We await the fetch with an abort timeout
// so we're sure the HTTP request has been transmitted before we return to Slack
// (Slack requires a < 3s acknowledgment). Aborting stops us from waiting for
// the response — the receiving Lambda continues running to completion regardless.
// ---------------------------------------------------------------------------

async function dispatchToAdminTrigger(
  baseUrl: string,
  body: Record<string, unknown>
): Promise<void> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    logger.error("Missing ADMIN_SECRET — cannot dispatch background action");
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    await fetch(`${baseUrl}/api/admin/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, secret }),
      signal: controller.signal,
    });
  } catch {
    // AbortError is expected — the request was sent, we just stopped waiting.
    // Any other error means the dispatch itself failed; the Slack error handler
    // in the run* function will post a thread warning if it has context.
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
    await dispatchToAdminTrigger(baseUrl, {
      action: "update",
      notionPageId,
      adminMessageTs,
      originalText,
    });
  } else if (action.action_id === "send_final_invoice") {
    const promptMessageTs = adminMessageTs;
    const parentTs = message?.thread_ts as string | undefined;
    await dispatchToAdminTrigger(baseUrl, {
      action: "final-invoice",
      notionPageId,
      promptMessageTs,
      parentTs,
    });
  } else {
    await dispatchToAdminTrigger(baseUrl, {
      action: "retainer",
      notionPageId,
      adminMessageTs,
      originalText,
    });
  }

  return NextResponse.json({ ok: true });
}
