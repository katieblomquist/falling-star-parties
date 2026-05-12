

import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { characterList as characters, dresses, extras, packages, characterNameMap, packageNameMap } from "@/app/content";
import { emailService } from "@/lib/emailService";  
import { generateEmailTemplate } from "@/lib/emailTemplate";
import { logger } from "@/lib/logger";
import { postBookingToSlack } from "@/lib/slackService";

// All environment variables will be read at runtime

type CharacterSelection = { characterId: number; dressId: number };


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
      agreeToTos,
      captchaToken,
      travelFee,
    } = body;

    // Verify reCAPTCHA token server-side
    const recaptchaSecret = process.env.RECAPTCHA_V3_SECRET_KEY;
    if (!recaptchaSecret) {
      requestLogger.error("Missing RECAPTCHA_V3_SECRET_KEY configuration", { email });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    if (!captchaToken) {
      requestLogger.warn("Missing captcha token", { email });
      return NextResponse.json({ error: "CAPTCHA verification failed." }, { status: 400 });
    }
    const recaptchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: recaptchaSecret, response: captchaToken }).toString(),
    });
    if (!recaptchaRes.ok) {
      requestLogger.error("reCAPTCHA siteverify request failed", { status: recaptchaRes.status });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    const recaptchaData = await recaptchaRes.json();
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      requestLogger.warn("reCAPTCHA verification failed", { email, score: recaptchaData.score });
      return NextResponse.json({ error: "CAPTCHA verification failed." }, { status: 400 });
    }

    requestLogger.info("Form submission received", {
      email,
      eventType,
      packageId,
      characterCount: characterSelections.length,
      extrasCount: extrasIds.length,
    });

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
      "Agree to TOS": { checkbox: Boolean(agreeToTos) },
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

    if (typeof travelFee === "number" && travelFee > 0) {
      properties["Travel Fee"] = { number: travelFee };
    }

    // Read environment variables at runtime to ensure they're available
    const notionKey = process.env.NOTION_KEY;
    const notionDatabaseId = process.env.NOTION_DATABASE_ID;

    if (!notionKey) {
      requestLogger.error("Missing NOTION_KEY configuration", { email });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    if (!notionDatabaseId) {
      requestLogger.error("Missing NOTION_DATABASE_ID configuration", { email });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // Create Notion client at runtime to ensure env vars are available
    const notion = new Client({ auth: notionKey });

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

    // Post booking to Slack performer channels + admin channel
    try {
      const characterRealNames = (characterSelections as CharacterSelection[])
        .map((s) => characters.find((c) => c.id === s.characterId)?.name)
        .filter((n): n is string => Boolean(n))
        .map((displayName) => characterNameMap[displayName] ?? displayName);

      const { adminMessageTs, channelTimestamps } = await postBookingToSlack({
        notionPageId: page.id,
        clientFirstName: firstName ?? "",
        clientLastName: lastName ?? "",
        dateTime,
        address,
        packageId,
        characterRealNames,
        dressNames,
      });

      // Persist admin + per-channel message timestamps to Notion so the
      // reaction listener can thread replies to the correct admin post.
      const tsUpdates: Array<{ pageId: string; key: string; value: string }> = [];
      if (adminMessageTs) {
        tsUpdates.push({ pageId: page.id, key: "Slack Admin TS", value: adminMessageTs });
      }
      for (const [charName, ts] of Object.entries(channelTimestamps)) {
        tsUpdates.push({ pageId: page.id, key: `Slack ${charName} TS`, value: ts });
      }
      for (const update of tsUpdates) {
        await notion.pages.update({
          page_id: update.pageId,
          properties: {
            [update.key]: { rich_text: [{ text: { content: update.value } }] },
          },
        });
      }

      requestLogger.info("Slack posts sent", { pageId: page.id, adminMessageTs });
    } catch (slackError) {
      // Non-fatal — log and continue
      requestLogger.error("Failed to post to Slack", {
        email,
        errorMessage: slackError instanceof Error ? slackError.message : String(slackError),
      }, slackError);
    }

    // Send email notification
    let emailResult: { success: boolean; error?: string } = { success: false };
    try {
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
        ...(emailResult.error ? { emailError: emailResult.error } : {}),
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
    const publicErrorMessage = "Something went wrong. Please try again.";
    const statusCode = 500;

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
