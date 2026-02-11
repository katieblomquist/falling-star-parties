

import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { characters, dresses, extras, packages } from "@/app/mockdata";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const RECAPTCHA_V3_SECRET = process.env.RECAPTCHA_V3_SECRET_KEY ?? '';
const RECAPTCHA_V2_SECRET = process.env.RECAPTCHA_V2_SECRET_KEY ?? '';
const SCORE_THRESHOLD = 0.5;

type CharacterSelection = { characterId: number; dressId: number };

const characterNameMap: Record<string, string> = {
  "Ice Queen": "Elsa",
  "Snow Princess": "Anna",
  "Mermaid Princess": "Ariel",
  "Rose Princess": "Belle",
  "Glass Slipper Princess": "Cinderella",
  "Tower Princess": "Rapunzel",
  "Sleeping Princess": "Aurora",
  "Bubble Queen": "Glinda",
};

const packageNameMap: Record<string, string> = {
  "Dream": "Dream - 30 Min",
  "Sparkle": "Sparkle - 60 Min",
  "Shine": "Shine - 90 Min",
  "One Hour Meet and Greet": "Meet and Greet - 60 Min",
  "Two Hour Meet and Greet": "Meet and Greet - 120 Min",
};

function buildAdditionalComments(orgName: string | null, additionalInfo: string | null) {
  const pieces: string[] = [];

  if (orgName) {
    pieces.push(`Organization: ${orgName}`);
  }

  if (additionalInfo) {
    pieces.push(additionalInfo);
  }

  return pieces.join("\n");
}

function toTitleProperty(content: string) {
  return { title: [{ text: { content } }] };
}

function toTextProperty(content: string) {
  return { rich_text: [{ text: { content } }] };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      dateTime,
      address,
      packageId,
      characterSelections = [],
      extrasIds = [],
      eventType,
      childName,
      childAge,
      orgName,
      numChildren,
      locationPref,
      photoPref,
      additionalInfo,
      captchaToken,
      captchaVersion,
    } = body;

    // --- reCAPTCHA verification ---
    if (!captchaToken) {
      return NextResponse.json({ error: "Captcha verification required" }, { status: 400 });
    }

    const captchaSecret = captchaVersion === 'v2' ? RECAPTCHA_V2_SECRET : RECAPTCHA_V3_SECRET;
    if (!captchaSecret) {
      console.error(`Missing RECAPTCHA secret key for ${captchaVersion}`);
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const captchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: captchaSecret, response: captchaToken }),
    });
    const captchaData = await captchaResponse.json();

    if (!captchaData.success) {
      return NextResponse.json({ error: "Captcha verification failed" }, { status: 403 });
    }

    if (captchaVersion === 'v3' && (captchaData.score ?? 0) < SCORE_THRESHOLD) {
      return NextResponse.json({ error: "Captcha score too low" }, { status: 403 });
    }
    // --- End reCAPTCHA verification ---

    if (!notionDatabaseId) {
      return NextResponse.json({ error: "Missing NOTION_DATABASE_ID" }, { status: 500 });
    }

    if (!process.env.NOTION_TOKEN) {
      return NextResponse.json({ error: "Missing NOTION_TOKEN" }, { status: 500 });
    }

    const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
    const rawPackageName = packages.find((item) => item.id === packageId)?.title ?? "Unknown";
    const packageName = packageNameMap[rawPackageName] ?? rawPackageName;
    const eventTypeName = eventType ?? "Unknown";
    const characterNames = (characterSelections as CharacterSelection[])
      .map((selection) => characters.find((item) => item.id === selection.characterId)?.name)
      .filter((name): name is string => Boolean(name))
      .map((name) => ({ name: characterNameMap[name] ?? name }));
    const dressNames = (characterSelections as CharacterSelection[])
      .map((selection) => {
        const dress = dresses.find((item) => item.id === selection.dressId);
        const character = characters.find((item) => item.id === selection.characterId);
        
        if (!dress || !character) return null;
        
        const dressName = dress.name;
        const characterName = characterNameMap[character.name] ?? character.name;
        
        // Append character name for specific dress types
        if (dressName === "Adventure Dress" || dressName === "Ballgown" || dressName === "Holiday Dress") {
          return `${dressName} (${characterName})`;
        }
        
        return dressName;
      })
      .filter(Boolean) as string[];
    const extrasNames = (extrasIds as number[])
      .map((id) => extras.find((item) => item.id === id)?.title)
      .filter(Boolean) as string[];

    const additionalComments = buildAdditionalComments(orgName ?? null, additionalInfo ?? null);

    const properties: Record<string, any> = {
      "Client name": toTitleProperty(fullName),
      "Event date": { date: { start: dateTime } },
      "Email": { email },
      "Phone": { phone_number: phone },
      "Event Type": { select: { name: eventTypeName } },
      "Location": toTextProperty(address),
      "Event Package": { select: { name: packageName } },
      "Extras": { multi_select: extrasNames.map((name) => ({ name })) },
      "Characters": { multi_select: characterNames },
      "Location Pref": { select: { name: locationPref } },
      "Photos Allowed": { checkbox: Boolean(photoPref) },
    };

    if (additionalComments) {
      properties["Additional Comments"] = toTextProperty(additionalComments);
    }

    if (dressNames.length > 0) {
      properties["Dress"] = { multi_select: dressNames.map((name) => ({ name })) };
    }

    if (childName) {
      properties["Child's Name"] = toTextProperty(childName);
    }

    if (typeof childAge === "number") {
      properties["Child's Age"] = { number: childAge };
    }

    if (typeof numChildren === "number") {
      properties["Number of Children"] = { number: numChildren };
    }

    const page = await notion.pages.create({
      parent: { database_id: notionDatabaseId },
      properties,
    });

    return NextResponse.json(
      { message: "Event request successfully created", pageId: page.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
