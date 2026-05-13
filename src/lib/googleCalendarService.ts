import { google } from "googleapis";
import { Client } from "@notionhq/client";
import { logger } from "@/lib/logger";
import { PdfEventData } from "@/app/api/generatePdf/pdfData";
import { packages } from "@/app/content";

// ---------------------------------------------------------------------------
// OAuth2 client — uses the combined Gmail + Calendar refresh token
// ---------------------------------------------------------------------------

function getOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Google OAuth2 credentials. Ensure GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are set."
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

// ---------------------------------------------------------------------------
// Notion performers lookup
// Fetches each related performer page by ID and returns name + email pairs
// ---------------------------------------------------------------------------

interface PerformerInfo {
  name: string;
  email: string;
}

async function lookupPerformers(pageIds: string[]): Promise<PerformerInfo[]> {
  if (!pageIds.length) return [];

  const notionKey = process.env.NOTION_KEY;
  if (!notionKey) {
    logger.warn("Missing NOTION_KEY — skipping performer lookup");
    return [];
  }

  const notion = new Client({ auth: notionKey });
  const performers: PerformerInfo[] = [];

  await Promise.all(
    pageIds.map(async (id) => {
      try {
        const page = await notion.pages.retrieve({ page_id: id });
        const props = (page as Record<string, unknown>).properties as Record<string, unknown>;

        const nameProp = props["Name"] as { title?: Array<{ plain_text: string }> } | undefined;
        const emailProp = props["Email"] as { email?: string } | undefined;

        const name = nameProp?.title?.[0]?.plain_text ?? "";
        const email = emailProp?.email ?? "";

        if (name || email) {
          performers.push({ name, email });
        }
      } catch (err) {
        logger.error("Failed to fetch performer page from Notion", { pageId: id }, err);
      }
    })
  );

  return performers;
}

// ---------------------------------------------------------------------------
// Duration string → minutes
// Parses values like "30 Minutes", "60 Minutes", "120 Minutes"
// ---------------------------------------------------------------------------

function durationToMinutes(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

// ---------------------------------------------------------------------------
// Build the event description shown to performers
// ---------------------------------------------------------------------------

function buildEventDescription(data: PdfEventData, performers: PerformerInfo[]): string {
  const lines: string[] = [];

  lines.push(`<b>Client:</b> ${data.clientFirstName} ${data.clientLastName}`);
  lines.push(`<b>Phone:</b> ${data.phone || "—"}`);

  if (data.childName) {
    const age = data.childAge != null ? `, Age ${data.childAge}` : "";
    lines.push(`<b>Child:</b> ${data.childName}${age}`);
  }

  // Characters with their dresses
  if (data.characterRealNames.length) {
    lines.push("");
    lines.push("<b>Characters & dresses:</b>");
    for (let i = 0; i < data.characterRealNames.length; i++) {
      const charName = data.characterRealNames[i];
      const dress = data.dressNames[i] ?? null;
      lines.push(dress ? `  • ${charName} — ${dress}` : `  • ${charName}`);
    }
  }

  lines.push("");
  lines.push(`<b>Location preference:</b> ${data.locationPref || "—"}`);

  if (data.extrasTitles.length) {
    lines.push(`<b>Add-ons:</b> ${data.extrasTitles.join(", ")}`);
  }

  return lines.join("<br>");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CalendarEventResult {
  eventId: string;
  eventLink: string;
}

/**
 * Creates a Google Calendar event on the info@fallingstarparties.com calendar
 * with all booking details in the description and assigned performers invited
 * as guests.
 */
export async function createBookingCalendarEvent(
  data: PdfEventData
): Promise<CalendarEventResult> {
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: "v3", auth });

  // Resolve package duration
  const pkg = packages.find((p) => p.id === data.packageId);
  const durationMinutes = pkg ? durationToMinutes(pkg.duration) : 60;

  // Build start and end times
  const startDate = new Date(data.dateTime);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  // Build event title: "Elsa & Anna - Birthday Party"
  const characterList = data.characterRealNames.join(" & ");
  const title = `${characterList} - ${data.eventType}`;

  // Look up performer names + emails from Notion relation page IDs
  const performers = await lookupPerformers(data.assignedPerformers);

  const attendees = performers.filter((p) => p.email).map((p) => ({ email: p.email }));

  const description = buildEventDescription(data, performers);

  const event = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: attendees.length ? "all" : "none",
    requestBody: {
      summary: title,
      location: data.address,
      description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "America/New_York",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "America/New_York",
      },
      attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 60 },        // 1 hour before
        ],
      },
    },
  });

  const eventId = event.data.id ?? "";
  const eventLink = event.data.htmlLink ?? "";

  logger.info("Google Calendar event created", {
    eventId,
    eventLink,
    title,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    performerCount: attendees.length,
    performers: performers.map((p) => p.name),
  });

  return { eventId, eventLink };
}
