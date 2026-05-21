import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

// ---------------------------------------------------------------------------
// Notion property helpers
// ---------------------------------------------------------------------------

type Props = Record<string, unknown>;

function getTitle(props: Props, key: string): string {
  const p = props[key] as { title?: Array<{ plain_text: string }> } | undefined;
  return p?.title?.[0]?.plain_text ?? "";
}
function getText(props: Props, key: string): string {
  const p = props[key] as { rich_text?: Array<{ plain_text: string }> } | undefined;
  return p?.rich_text?.[0]?.plain_text ?? "";
}
function getSelect(props: Props, key: string): string {
  const p = props[key] as { select?: { name: string } } | undefined;
  return p?.select?.name ?? "";
}
function getMultiSelect(props: Props, key: string): string[] {
  const p = props[key] as { multi_select?: Array<{ name: string }> } | undefined;
  return p?.multi_select?.map((s) => s.name) ?? [];
}
function getNumber(props: Props, key: string): number | null {
  const p = props[key] as { number?: number | null } | undefined;
  return p?.number ?? null;
}
function getDate(props: Props, key: string): string {
  const p = props[key] as { date?: { start: string } } | undefined;
  return p?.date?.start ?? "";
}
function getEmail(props: Props, key: string): string {
  const p = props[key] as { email?: string } | undefined;
  return p?.email ?? "";
}
function getPhone(props: Props, key: string): string {
  const p = props[key] as { phone_number?: string } | undefined;
  return p?.phone_number ?? "";
}

// ---------------------------------------------------------------------------
// Content lookup tables (mirrors automations/src/content.ts)
// ---------------------------------------------------------------------------

const packages = [
  { id: 0, type: "Birthday Party", title: "Dream", duration: "30 Minutes" },
  { id: 1, type: "Birthday Party", title: "Sparkle", duration: "60 Minutes" },
  { id: 2, type: "Birthday Party", title: "Shine", duration: "90 Minutes" },
  { id: 3, type: "Public Event", title: "One Hour Meet and Greet", duration: "60 Minutes" },
  { id: 4, type: "Public Event", title: "Two Hour Meet and Greet", duration: "120 Minutes" },
  { id: 6, type: "Charity Event", title: "One Hour Meet and Greet", duration: "60 Minutes" },
  { id: 7, type: "Charity Event", title: "Two Hour Meet and Greet", duration: "120 Minutes" },
];

const packageNameMap: Record<string, string> = {
  "Dream": "Dream - 30 Min",
  "Sparkle": "Sparkle - 60 Min",
  "Shine": "Shine - 90 Min",
  "One Hour Meet and Greet": "Meet and Greet - 60 Min",
  "Two Hour Meet and Greet": "Meet and Greet - 120 Min",
};

const characters = [
  { id: 0, name: "Ice Queen",              realName: "Elsa" },
  { id: 1, name: "Snow Princess",          realName: "Anna" },
  { id: 2, name: "Mermaid Princess",       realName: "Ariel" },
  { id: 3, name: "Rose Princess",          realName: "Belle" },
  { id: 4, name: "Glass Slipper Princess", realName: "Cinderella" },
  { id: 5, name: "Sleeping Princess",      realName: "Aurora" },
  { id: 6, name: "Tower Princess",         realName: "Rapunzel" },
  { id: 7, name: "Bubble Queen",           realName: "Glinda" },
];

const dresses = [
  { id: 0,  name: "Ice Dress",          characterId: 0 },
  { id: 1,  name: "Elements Dress",     characterId: 0 },
  { id: 2,  name: "Adventure Dress",    characterId: 0 },
  { id: 3,  name: "Yuletide Dress",     characterId: 0 },
  { id: 4,  name: "Coronation Dress",   characterId: 1 },
  { id: 5,  name: "Queen Dress",        characterId: 1 },
  { id: 6,  name: "Adventure Dress",    characterId: 1 },
  { id: 7,  name: "Yuletide Dress",     characterId: 1 },
  { id: 8,  name: "Walking Tail",       characterId: 2 },
  { id: 9,  name: "Ballgown",           characterId: 2 },
  { id: 10, name: "Ballgown",           characterId: 3 },
  { id: 11, name: "Holiday Dress",      characterId: 3 },
  { id: 12, name: "Ballgown",           characterId: 4 },
  { id: 13, name: "Ballgown",           characterId: 5 },
  { id: 14, name: "Adventure Dress",    characterId: 6 },
  { id: 15, name: "Holiday Dress",      characterId: 6 },
  { id: 16, name: "Bubble Dress",       characterId: 7 },
];

const extras = [
  { id: 0, title: "Storybook Keepsake" },
  { id: 1, title: "Deluxe Storybook Keepsake" },
  { id: 2, title: "Deluxe Princess Set" },
  { id: 3, title: "Gift Bags" },
  { id: 4, title: "Storytime" },
  { id: 5, title: "Interactive Storytime" },
  { id: 6, title: "Character Cards" },
  { id: 7, title: "Storytime" },
  { id: 8, title: "Interactive Storytime" },
];

// ---------------------------------------------------------------------------
// Parse a Notion page into the /intake payload format
// ---------------------------------------------------------------------------

function notionPageToIntakePayload(page: { properties: Props }) {
  const props = page.properties;

  const fullName = getTitle(props, "Client name");
  const [firstName, ...rest] = fullName.trim().split(" ");
  const lastName = rest.join(" ");

  const eventType = getSelect(props, "Event Type");
  const packageName = getSelect(props, "Event Package");

  // Resolve packageId from the stored Notion name back to numeric id
  const pkg =
    packages.find(
      (p) =>
        p.type === eventType &&
        (packageNameMap[p.title] === packageName || p.title === packageName)
    ) ??
    packages.find(
      (p) => packageNameMap[p.title] === packageName || p.title === packageName
    );
  const packageId = pkg?.id ?? 0;

  // Characters: Notion stores real names (e.g. "Elsa"), map back to characterId
  const characterRealNames = getMultiSelect(props, "Characters");
  const dressNotionNames = getMultiSelect(props, "Dress");

  const characterSelections = characterRealNames.map((realName) => {
    const char = characters.find((c) => c.realName === realName);
    if (!char) return null;

    // Find a dress for this character that matches one of the stored dress names
    const matchedDress = dresses.find(
      (d) => d.characterId === char.id && dressNotionNames.some((dn) => dn.includes(d.name))
    );
    return { characterId: char.id, dressId: matchedDress?.id ?? -1 };
  }).filter((s): s is { characterId: number; dressId: number } => s !== null);

  // Extras: stored as titles, map back to ids
  const extrasNames = getMultiSelect(props, "Extras");
  const extrasIds = extrasNames
    .map((name) => extras.find((e) => e.title === name)?.id)
    .filter((id): id is number => id !== undefined);

  const additionalComments = getText(props, "Additional Comments");

  return {
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    email: getEmail(props, "Email"),
    phone: getPhone(props, "Phone"),
    dateTime: getDate(props, "Event date"),
    address: getText(props, "Location"),
    packageId,
    characterSelections,
    extrasIds,
    eventType,
    childName: getText(props, "Child's Name") || null,
    childAge: getNumber(props, "Child's Age"),
    orgName: null,
    numChildren: getNumber(props, "Number of Children") ?? 0,
    locationPref: getSelect(props, "Location Pref"),
    photoPref: (props["Photos Allowed"] as { checkbox?: boolean } | undefined)?.checkbox ?? false,
    additionalInfo: additionalComments || null,
    agreeToTos: true,
    travelFee: getNumber(props, "Travel Fee") ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const automationServiceUrl = process.env.AUTOMATION_SERVICE_URL;
  const automationSecret = process.env.AUTOMATION_SHARED_SECRET;
  const adminSecret = process.env.ADMIN_SECRET;
  const notionKey = process.env.NOTION_KEY;

  if (!automationServiceUrl || !automationSecret) {
    return NextResponse.json({ error: "Automation service not configured" }, { status: 503 });
  }

  let body: { action: string; notionPageId: string; secret: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, notionPageId, secret } = body;

  if (!adminSecret || secret.trim() !== adminSecret.trim()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!action || !notionPageId) {
    return NextResponse.json({ error: "Missing action or notionPageId" }, { status: 400 });
  }

  // Slack notification: parse Notion page and POST to /intake as a new booking
  if (action === "slack-notification") {
    if (!notionKey) {
      return NextResponse.json({ error: "NOTION_KEY not configured" }, { status: 503 });
    }
    try {
      const notion = new Client({ auth: notionKey });
      const page = await notion.pages.retrieve({ page_id: notionPageId });
      const payload = notionPageToIntakePayload(page as { properties: Props });

      const upstream = await fetch(`${automationServiceUrl}/intake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${automationSecret}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await upstream.json();
      if (!upstream.ok) {
        return NextResponse.json(
          { error: data.error ?? `Upstream HTTP ${upstream.status}` },
          { status: upstream.status }
        );
      }
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to parse Notion page" },
        { status: 502 }
      );
    }
  }

  // All other actions: forward to /admin/trigger on the automation service
  try {
    const upstream = await fetch(`${automationServiceUrl}/admin/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${automationSecret}`,
      },
      body: JSON.stringify({ action, notionPageId, secret }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json(
        { error: data.error ?? `Upstream HTTP ${upstream.status}` },
        { status: upstream.status }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Network error" },
      { status: 502 }
    );
  }
}
