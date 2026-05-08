import { NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/emailService";

const NAME_MAX = 100;
const MESSAGE_MAX = 2000;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_V3_SECRET_KEY;
  if (!secretKey) {
    // If secret isn't configured, fail closed
    return false;
  }
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
  });
  const data = await res.json() as { success: boolean; score?: number; "error-codes"?: string[] };
  return data.success && (data.score ?? 0) >= 0.5;
}

function generateContactEmailHtml(name: string, email: string, message: string): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #1D1E1F; margin: 0; padding: 0; }
          .header { background-color: #343B95; padding: 24px 32px; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
          .body { padding: 28px 32px; }
          .field { margin-bottom: 20px; }
          .field-label { font-size: 12px; font-weight: 700; text-transform: uppercase;
                         letter-spacing: 0.08em; color: #343B95; margin-bottom: 4px; }
          .field-value { font-size: 15px; color: #1D1E1F; white-space: pre-wrap; }
          .divider { border: none; border-top: 1px solid #DADDE5; margin: 24px 0; }
          .footer { background-color: #DADDE5; padding: 14px 32px;
                    font-size: 12px; color: #555; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>New Contact Request — Falling Star Parties</h1>
        </div>
        <div class="body">
          <div class="field">
            <div class="field-label">Full Name</div>
            <div class="field-value">${safeName}</div>
          </div>
          <hr class="divider" />
          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value"><a href="mailto:${safeEmail}" style="color:#343B95;">${safeEmail}</a></div>
          </div>
          <hr class="divider" />
          <div class="field">
            <div class="field-label">Message / Request</div>
            <div class="field-value">${safeMessage}</div>
          </div>
        </div>
        <div class="footer">
          Submitted via the Falling Star Parties website contact widget.
        </div>
      </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, recaptchaToken } = body;

    // reCAPTCHA verification
    if (!recaptchaToken || typeof recaptchaToken !== "string") {
      return NextResponse.json({ error: "reCAPTCHA verification failed." }, { status: 400 });
    }
    const recaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaValid) {
      return NextResponse.json({ error: "reCAPTCHA verification failed." }, { status: 400 });
    }

    // Field validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }
    if (name.trim().length > NAME_MAX) {
      return NextResponse.json({ error: `Name must be ${NAME_MAX} characters or fewer.` }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    if (message.trim().length > MESSAGE_MAX) {
      return NextResponse.json({ error: `Message must be ${MESSAGE_MAX} characters or fewer.` }, { status: 400 });
    }

    const html = generateContactEmailHtml(
      name.trim(),
      email.trim(),
      message.trim()
    );

    await emailService.sendEmail({
      to: "info@fallingstarparties.com",
      subject: `New Contact Request — ${name.trim()}`,
      html,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
