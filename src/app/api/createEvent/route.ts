

import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { characters, dresses, extras, packages } from "@/app/mockdata";
import { emailService } from "@/lib/emailService";
import { generateEmailTemplate } from "@/lib/emailTemplate";
import { logger } from "@/lib/logger";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const notionDatabaseId = process.env.NOTION_DATABASE_ID;

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
  const requestId = logger.generateRequestId();
  const requestLogger = logger.withContext({ requestId });
  const startTime = Date.now();

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
      // ...existing code...
    } = body;

    requestLogger.info("Form submission received", {
      email,
      eventType,
      packageId,
      characterCount: characterSelections.length,
      extrasCount: extrasIds.length,
      // ...existing code...
    });

    // ...existing code...
    if (!process.env.NOTION_TOKEN) {
      requestLogger.error("Missing NOTION_TOKEN configuration", { email });
      return NextResponse.json({ error: "Missing NOTION_TOKEN" }, { status: 500 });
    }

    // Process form data
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

    requestLogger.debug("Processed form data", {
      email,
      fullName,
      packageName,
      eventTypeName,
      characterNames: characterNames.map(c => c.name),
      dressNames,
      extrasNames
    });

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

    requestLogger.debug("Creating Notion database entry", {
      email,
      databaseId: notionDatabaseId,
      propertyCount: Object.keys(properties).length
    });

    if (!notionDatabaseId) {
      requestLogger.error("Missing NOTION_DATABASE_ID configuration", { email });
      return NextResponse.json({ error: "Missing NOTION_DATABASE_ID" }, { status: 500 });
    }
    const page = await requestLogger.time(
      "Notion page creation",
      () => notion.pages.create({
        parent: { database_id: notionDatabaseId as string },
        properties,
      }),
      { email, operation: "notion_create" }
    );

    requestLogger.info("Notion entry created successfully", {
      email,
      pageId: page.id,
      databaseId: notionDatabaseId
    });

    // Send email notification
    let emailResult: { success: boolean; error?: string } = { success: false };
    try {
      requestLogger.debug("Preparing email notification", { email });
      
      const emailData = {
        firstName,
        lastName,
        email,
        phone,
        dateTime,
        address,
        packageId,
        characterSelections: characterSelections as { characterId: number; dressId: number }[],
        extrasIds: extrasIds as number[],
        eventType,
        childName,
        childAge,
        orgName,
        numChildren,
        locationPref,
        photoPref,
        additionalInfo,
      };

      const { html, subject } = generateEmailTemplate(emailData);
      
      requestLogger.debug("Generated email template", {
        email,
        subject,
        htmlLength: html.length
      });
      
      await requestLogger.time(
        "Email sending",
        () => emailService.sendEmail({
          to: 'info@fallingstarparties.com',
          subject,
          html,
        }),
        { email, operation: "email_send" }
      );

      requestLogger.info("Email notification sent successfully", {
        email,
        recipient: 'info@fallingstarparties.com',
        subject
      });
      
      emailResult.success = true;
    } catch (emailError) {
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
      
      requestLogger.error("Failed to send email notification", {
        email,
        recipient: 'info@fallingstarparties.com',
        errorMessage,
        errorType: emailError instanceof Error ? emailError.constructor.name : typeof emailError
      }, emailError);
      
      emailResult = { success: false, error: errorMessage };
    }

    const totalDuration = Date.now() - startTime;
    requestLogger.info("Form submission completed", {
      email,
      pageId: page.id,
      emailSent: emailResult.success,
      totalDuration,
      emailError: emailResult.error
    });

    return NextResponse.json(
      { 
        message: "Event request successfully created", 
        pageId: page.id,
        emailSent: emailResult.success,
        emailError: emailResult.error
      },
      { status: 201 }
    );
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = error instanceof Error ? error.constructor.name : typeof error;

    requestLogger.error("Form submission failed", {
      errorMessage,
      errorType,
      totalDuration,
      stack: error instanceof Error ? error.stack : undefined
    }, error);

    // Provide more specific error information for troubleshooting
    let publicErrorMessage = "Internal server error";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('NOTION')) {
        publicErrorMessage = "Failed to save booking to database";
        requestLogger.error("Notion integration error", {
          hasNotionToken: !!process.env.NOTION_TOKEN,
          hasNotionDatabaseId: !!notionDatabaseId,
          notionDatabaseId
        }, error);
      } else if (error.message.includes('fetch')) {
        publicErrorMessage = "External service connection failed";
      }
    }

    return NextResponse.json({ 
      error: publicErrorMessage,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { 
        debug: {
          errorMessage,
          errorType,
          requestId
        }
      })
    }, { status: statusCode });
  }
}

// Handle GET requests to provide endpoint information
export async function GET() {
  logger.info("GET request to createEvent endpoint");
  
  return NextResponse.json({
    message: "Event creation endpoint",
    method: "POST",
    description: "Submit booking form data to create a new Falling Star Parties event request",
    requiredFields: [
      "firstName", "lastName", "email", "phone", "dateTime", 
      "address", "packageId", "eventType"
    ],
    optionalFields: [
      "characterSelections", "extrasIds", "childName", "childAge", 
      "orgName", "numChildren", "locationPref", "photoPref", "additionalInfo"
    ],
    testEndpoints: {
      diagnostics: "/api/form-diagnostics",
      emailTest: "/api/test-email"
    }
  });
}
