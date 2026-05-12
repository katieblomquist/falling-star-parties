import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { Client } from "@upstash/qstash";
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
// Background dispatcher via QStash
//
// QStash accepts the job in ~50ms and returns immediately. It then delivers
// the payload to /api/slack/background as an independent HTTP request with its
// own Lambda invocation — no 3-second Slack timeout pressure.
// ---------------------------------------------------------------------------

async function dispatchToBackground(
  body: Record<string, unknown>
): Promise<void> {
  const token = process.env.QSTASH_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!token || !appUrl) {
    logger.error("Missing QSTASH_TOKEN or NEXT_PUBLIC_APP_URL — cannot dispatch background action");
    return;
  }

  const baseUrl = process.env.QSTASH_URL ?? "https://qstash.upstash.io";
  const client = new Client({ token, baseUrl });
  const destination = `${appUrl}/api/slack/background`;

  try {
    await client.publishJSON({ url: destination, body });
    logger.info("Dispatched background job via QStash", { destination, action: body.action });
  } catch (err) {
    logger.error("Failed to dispatch to QStash", {
      errorMessage: err instanceof Error ? err.message : String(err),
    });
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

  // Dispatch background work to QStash — returns in ~50ms so we can
  // acknowledge Slack well within the 3-second window.
  if (action.action_id === "update_booking") {
    await dispatchToBackground({
      action: "update",
      notionPageId,
      adminMessageTs,
      originalText,
    });
  } else if (action.action_id === "send_final_invoice") {
    const promptMessageTs = adminMessageTs;
    const parentTs = message?.thread_ts as string | undefined;
    await dispatchToBackground({
      action: "final-invoice",
      notionPageId,
      promptMessageTs,
      parentTs,
    });
  } else {
    await dispatchToBackground({
      action: "retainer",
      notionPageId,
      adminMessageTs,
      originalText,
    });
  }

  return NextResponse.json({ ok: true });
}
