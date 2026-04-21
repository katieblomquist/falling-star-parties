import { WebClient } from "@slack/web-api";
import { characters, packages } from "@/app/content";
import { buildCharacterBulletValue } from "@/app/api/generatePdf/pdfData";

// ---------------------------------------------------------------------------
// Slack client — initialised lazily so env vars are read at runtime
// ---------------------------------------------------------------------------

let _client: WebClient | null = null;
function getClient(): WebClient {
  if (!_client) {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) throw new Error("Missing SLACK_BOT_TOKEN");
    _client = new WebClient(token);
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Character → Slack channel name (lowercase real name)
// ---------------------------------------------------------------------------

const CHARACTER_CHANNEL: Record<string, string> = {
  Elsa: "elsa",
  Anna: "anna",
  Ariel: "ariel",
  Belle: "belle",
  Cinderella: "cinderella",
  Aurora: "aurora",
  Rapunzel: "rapunzel",
  Glinda: "glinda",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse city, state, zip from a free-text US address string.
 *  e.g. "123 Main St, Baltimore, MD 21201" → "Baltimore, MD 21201"
 *  Falls back to the full address if parsing fails.
 */
export function parseCityStateZip(address: string): string {
  // Match "City, ST 00000" at the end of the string
  const match = address.match(/([A-Za-z\s]+),\s*([A-Z]{2})\s+(\d{5}(-\d{4})?)\s*$/);
  if (match) {
    return `${match[1].trim()}, ${match[2]} ${match[3]}`;
  }
  return address;
}

/** Format a dateTime string into a readable label. */
function formatDateTime(dateTime: string): string {
  return new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SlackBookingPayload {
  notionPageId: string;
  clientFirstName: string;
  clientLastName: string;
  dateTime: string;
  address: string;
  packageId: number;
  /** Real names (e.g. "Elsa", "Ariel") */
  characterRealNames: string[];
  /** Dress selections — optional, empty array if none */
  dressNames: string[];
}

export interface SlackBookingResult {
  /** Timestamp of the admin channel message */
  adminMessageTs: string | undefined;
  /** Map of characterRealName → performer channel message timestamp */
  channelTimestamps: Record<string, string>;
}

/**
 * Posts the booking to every relevant performer channel and to the admin
 * channel. Returns timestamps for both admin and per-character posts so
 * the reaction listener can match reactions back to Notion pages.
 */
export async function postBookingToSlack(
  payload: SlackBookingPayload
): Promise<SlackBookingResult> {
  const slack = getClient();
  const adminChannelId = process.env.SLACK_ADMIN_CHANNEL_ID;
  if (!adminChannelId) throw new Error("Missing SLACK_ADMIN_CHANNEL_ID");

  const pkg = packages.find((p) => p.id === payload.packageId);
  const duration = pkg?.duration ?? "Unknown";

  const formattedDate = formatDateTime(payload.dateTime);
  const cityStateZip = parseCityStateZip(payload.address);

  const characterLine = buildCharacterBulletValue(payload.characterRealNames, payload.dressNames);

  const multiCharNote =
    payload.characterRealNames.length > 1
      ? `This booking includes ${payload.characterRealNames.join(" + ")}`
      : null;

  // ── Performer channel posts ──────────────────────────────────────────────
  const channelTimestamps: Record<string, string> = {};

  for (const realName of payload.characterRealNames) {
    const channel = CHARACTER_CHANNEL[realName];
    if (!channel) continue;

    const lines = [
      `*Date & Time:* ${formattedDate}`,
      `*Location:* ${cityStateZip}`,
      `*Duration:* ${duration}`,
      ...(multiCharNote ? [multiCharNote] : []),
    ];

    const result = await slack.chat.postMessage({
      channel: `#${channel}`,
      text: lines.join("\n"),
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: lines.join("\n") },
        },
      ],
    });

    if (result.ts) {
      channelTimestamps[realName] = result.ts;
    }
  }

  // ── Admin channel post ───────────────────────────────────────────────────
  const adminLines = [
    `*Client:* ${payload.clientFirstName} ${payload.clientLastName}`,
    `*Date & Time:* ${formattedDate}`,
    `*Location:* ${payload.address}`,
    `*Duration:* ${duration}`,
    `*Characters:* ${characterLine}`,
  ];

  const adminResult = await slack.chat.postMessage({
    channel: adminChannelId,
    text: adminLines.join("\n"),
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: adminLines.join("\n") },
      },
      {
        type: "actions",
        block_id: "finalize_actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Finalize", emoji: true },
            style: "primary",
            action_id: "finalize_booking",
            value: payload.notionPageId,
          },
        ],
      },
    ],
  });

  return { adminMessageTs: adminResult.ts, channelTimestamps };
}

/**
 * Posts a reply to the admin thread when a performer confirms via reaction.
 */
export async function postPerformerConfirmation(
  adminMessageTs: string,
  characterChannel: string,
  performerName: string
): Promise<void> {
  const slack = getClient();
  const adminChannelId = process.env.SLACK_ADMIN_CHANNEL_ID;
  if (!adminChannelId) throw new Error("Missing SLACK_ADMIN_CHANNEL_ID");

  await slack.chat.postMessage({
    channel: adminChannelId,
    thread_ts: adminMessageTs,
    text: `✅ #${characterChannel} — ${performerName} confirmed`,
  });
}

/**
 * Updates the admin message to show finalization is complete.
 */
export async function markFinalizedInSlack(
  adminMessageTs: string,
  originalText: string,
  notionPageId: string
): Promise<void> {
  const slack = getClient();
  const adminChannelId = process.env.SLACK_ADMIN_CHANNEL_ID;
  if (!adminChannelId) throw new Error("Missing SLACK_ADMIN_CHANNEL_ID");

  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  await slack.chat.update({
    channel: adminChannelId,
    ts: adminMessageTs,
    text: originalText,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: originalText },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `✅ *Last finalized ${timestamp}* — Gmail draft ready in your inbox.`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Update Booking", emoji: true },
            style: "primary",
            action_id: "update_booking",
            value: notionPageId,
          },
        ],
      },
    ],
  });
}
