import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/emailService";
import { generateEmailTemplate } from "@/lib/emailTemplate";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const requestId = logger.generateRequestId();
  const requestLogger = logger.withContext({ requestId });

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

    // 1. Verify reCAPTCHA
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

    // 2. Send email notification to Katie (user waits for this)
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
    await emailService.sendEmail({
      to: "info@fallingstarparties.com",
      subject,
      html,
    });

    requestLogger.info("Email notification sent", { email });

    // 3. Fire-and-forget POST to automation service (Notion + Slack)
    const automationServiceUrl = process.env.AUTOMATION_SERVICE_URL;
    const automationSecret = process.env.AUTOMATION_SHARED_SECRET;
    if (automationServiceUrl && automationSecret) {
      const payload = {
        firstName, lastName, email, phone, dateTime, address, packageId,
        characterSelections, extrasIds, eventType, childName, childAge,
        orgName, numChildren, locationPref, photoPref, additionalInfo,
        agreeToTos, travelFee,
      };
      fetch(`${automationServiceUrl}/intake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${automationSecret}`,
        },
        body: JSON.stringify(payload),
      }).catch((err) => {
        requestLogger.error("Fire-and-forget to automation service failed", {
          errorMessage: err instanceof Error ? err.message : String(err),
        });
      });
    } else {
      requestLogger.warn("Automation service not configured — skipping Notion/Slack", { email });
    }

    return NextResponse.json(
      { message: "Event request successfully created", emailSent: true },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    requestLogger.error("Form submission failed", { errorMessage }, error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Event creation endpoint",
    method: "POST",
  });
}
