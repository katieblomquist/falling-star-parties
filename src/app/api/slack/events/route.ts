import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { Client } from "@notionhq/client";
import { postPerformerConfirmation } from "@/lib/slackService";
import { logger } from "@/lib/logger";
import { WebClient } from "@slack/web-api";

// ---------------------------------------------------------------------------
// Slack signature verification
// ---------------------------------------------------------------------------

async function verifySlackSignature(request: NextRequest, rawBody: string): Promise<boolean> {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const timestamp = request.headers.get("x-slack-request-timestamp");
  const slackSignature = request.headers.get("x-slack-signature");
  if (!timestamp || !slackSignature) return false;

  // Reject requests older than 5 minutes
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
// Map Slack channel name → character real name
// ---------------------------------------------------------------------------

const CHANNEL_TO_CHARACTER: Record<string, string> = {
  elsa: "Elsa",
  anna: "Anna",
  ariel: "Ariel",
  belle: "Belle",
  cinderella: "Cinderella",
  aurora: "Aurora",
  rapunzel: "Rapunzel",
  glinda: "Glinda",
};

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();

  // ── URL verification challenge (one-time Slack setup) ───────────────────
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  // ── Verify Slack signature ───────────────────────────────────────────────
  const valid = await verifySlackSignature(request, rawBody);
  if (!valid) {
    logger.warn("Invalid Slack signature on events endpoint");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = body.event as Record<string, unknown> | undefined;
  if (!event) return NextResponse.json({ ok: true });

  // ── Only handle white_check_mark reactions ───────────────────────────────
  if (event.type !== "reaction_added" || event.reaction !== "white_check_mark") {
    return NextResponse.json({ ok: true });
  }

  // ── Identify which channel the reaction was added in ────────────────────
  const item = event.item as Record<string, unknown> | undefined;
  const channelId = item?.channel as string | undefined;
  if (!channelId) return NextResponse.json({ ok: true });

  try {
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

    // Resolve channel name from ID
    const channelInfo = await slack.conversations.info({ channel: channelId });
    const channelName = (channelInfo.channel as Record<string, unknown>)?.name as string | undefined;
    if (!channelName || !CHANNEL_TO_CHARACTER[channelName]) {
      return NextResponse.json({ ok: true }); // Not a character channel
    }

    // Resolve performer display name
    const userId = event.user as string;
    const userInfo = await slack.users.info({ user: userId });
    const performerName =
      ((userInfo.user as Record<string, unknown>)?.profile as Record<string, unknown>)
        ?.display_name as string ||
      ((userInfo.user as Record<string, unknown>)?.real_name as string) ||
      "A performer";

    // Find the Notion page that owns this Slack message so we can get the
    // admin thread timestamp.
    const messageTs = item?.ts as string | undefined;
    if (!messageTs) return NextResponse.json({ ok: true });

    const notionKey = process.env.NOTION_KEY;
    const notionDatabaseId = process.env.NOTION_DATABASE_ID;
    if (!notionKey || !notionDatabaseId) throw new Error("Missing Notion config");

    const notion = new Client({ auth: notionKey });

    // Query Notion for a page whose Slack Admin TS matches the message ts
    // of the post in the performer channel. Since we store the admin TS (not
    // per-channel TS), we search by the message item_ts — which is the ts of
    // the original performer post. We store that per-channel ts in Notion too.
    // For simplicity we search all recent pages and match by admin TS stored.
    const queryResult = await notion.databases.query({
      database_id: notionDatabaseId,
      filter: {
        property: "Slack Admin TS",
        rich_text: { is_not_empty: true },
      },
      sorts: [{ property: "Event date", direction: "descending" }],
      page_size: 50,
    });

    // Find the page whose performer-channel post ts matches the reacted message.
    // We stored admin TS on the page; we need to match performer post ts.
    // Since we don't store per-channel post ts, we'll instead look for the
    // page that was most recently booked and whose admin post is still pending.
    // A more robust approach: store performer post ts per channel. For now
    // we match by finding any page with a Slack Admin TS and no finalization
    // timestamp yet — and surface the admin TS to reply to.
    //
    // Find page by checking if reacted message ts appears in any stored channel TS.
    // We store "Slack [Channel] TS" properties for each character channel.
    const matchedPage = queryResult.results.find((page) => {
      const props = (page as Record<string, unknown>).properties as Record<string, unknown>;
      const channelTsProp = props[`Slack ${CHANNEL_TO_CHARACTER[channelName]} TS`] as
        | { rich_text: Array<{ plain_text: string }> }
        | undefined;
      return channelTsProp?.rich_text?.[0]?.plain_text === messageTs;
    });

    if (!matchedPage) {
      logger.warn("Could not match reacted message to a Notion page", { messageTs, channelName });
      return NextResponse.json({ ok: true });
    }

    const props = (matchedPage as Record<string, unknown>).properties as Record<string, unknown>;
    const adminTsProp = props["Slack Admin TS"] as
      | { rich_text: Array<{ plain_text: string }> }
      | undefined;
    const adminMessageTs = adminTsProp?.rich_text?.[0]?.plain_text;

    if (!adminMessageTs) return NextResponse.json({ ok: true });

    await postPerformerConfirmation(adminMessageTs, channelName, performerName);

    logger.info("Performer confirmation posted to admin thread", {
      channelName,
      performerName,
      adminMessageTs,
    });
  } catch (err) {
    logger.error("Error handling reaction event", {
      errorMessage: err instanceof Error ? err.message : String(err),
    }, err);
  }

  return NextResponse.json({ ok: true });
}
