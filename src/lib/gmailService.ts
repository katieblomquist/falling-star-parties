import { google } from "googleapis";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// OAuth2 client
// ---------------------------------------------------------------------------

function getOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Gmail OAuth2 credentials. Ensure GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN are set."
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
// Email HTML template — soft & whimsical
// ---------------------------------------------------------------------------

function buildFinalizationEmailHtml(
  clientFirstName: string,
  squareInvoiceUrl: string,
  baseUrl: string
): string {
  const logoUrl = `${baseUrl}/logo.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Booking Finalization — Falling Star Parties</title>
</head>
<body style="margin:0;padding:0;background-color:#f5eef8;font-family:'Georgia',serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5eef8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(52,59,149,0.10);">

          <!-- Logo header -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#343B95 0%,#5c64c0 100%);padding:32px 40px 24px;">
              <img src="${logoUrl}" alt="Falling Star Parties" width="160" style="display:block;margin:0 auto 0;" />
            </td>
          </tr>

          <!-- Sparkle divider -->
          <tr>
            <td align="center" style="background:#EEF0FB;padding:10px 0;font-size:18px;letter-spacing:6px;color:#343B95;">
              ✦ &nbsp; ✦ &nbsp; ✦
            </td>
          </tr>

          <!-- Title band -->
          <tr>
            <td align="center" style="background:#fdf0f5;padding:18px 40px 14px;">
              <p style="margin:0;font-size:22px;font-weight:bold;color:#343B95;letter-spacing:0.5px;">
                Your Booking Finalization
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 44px 10px;">
              <p style="margin:0 0 16px;font-size:16px;color:#2a2a2a;line-height:1.7;">
                Hi ${clientFirstName}!
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.8;">
                Thank you for inviting Falling Star Parties to be part of your family's celebration!
                I've attached your <strong>Event Finalization Letter</strong> with all the key details and pricing.
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.8;">
                Please note that we do not offer the use of glitter products due to the potential
                for damage to our costumes. Given the limited time our princesses have for this part
                of your event, we limit our face painting to simple character-themed designs.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.8;">
                After you've reviewed it, please complete your event retainer via the link below
                within <strong>48 hours</strong> to secure your magical date. If you have any questions
                or need to request changes along the way, feel free to reach out — we're excited to
                help bring your vision to life!
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:4px 44px 28px;">
              <a href="${squareInvoiceUrl}"
                 style="display:inline-block;background-color:#343B95;color:#ffffff;font-size:15px;font-weight:bold;
                        text-decoration:none;padding:14px 36px;border-radius:50px;letter-spacing:0.5px;
                        box-shadow:0 4px 12px rgba(52,59,149,0.35);">
                Complete Event Retainer
              </a>
            </td>
          </tr>

          <!-- Sparkle divider -->
          <tr>
            <td align="center" style="background:#EEF0FB;padding:10px 0;font-size:18px;letter-spacing:6px;color:#343B95;">
              ✦ &nbsp; ✦ &nbsp; ✦
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:24px 44px 32px;">
              <p style="margin:0 0 4px;font-size:15px;color:#444444;line-height:1.8;">Warm Wishes,</p>
              <p style="margin:0 0 2px;font-size:16px;font-weight:bold;color:#343B95;">Katelyn</p>
              <p style="margin:0;font-size:14px;color:#888888;">Owner ✨ Falling Star Parties LLC</p>
            </td>
          </tr>

        </table>

        <!-- Footer note -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:16px;">
          <tr>
            <td align="center" style="font-size:12px;color:#aaaaaa;padding:0 20px;">
              Falling Star Parties LLC &nbsp;|&nbsp; (443) 327-9751 &nbsp;|&nbsp; info@fallingstarparties.com
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// MIME helpers
// ---------------------------------------------------------------------------

/** Encode a string to base64url (Gmail API requirement). */
function toBase64Url(str: string): string {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Build a MIME multipart/mixed message with HTML body + PDF attachment. */
function buildMimeMessage(opts: {
  to: string;
  from: string;
  subject: string;
  htmlBody: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}): string {
  const boundary = `----=_Part_${Date.now()}`;

  const mime = [
    `MIME-Version: 1.0`,
    `To: ${opts.to}`,
    `From: ${opts.from}`,
    `Subject: ${opts.subject}`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    opts.htmlBody,
    ``,
    `--${boundary}`,
    `Content-Type: application/pdf; name="${opts.pdfFilename}"`,
    `Content-Transfer-Encoding: base64`,
    `Content-Disposition: attachment; filename="${opts.pdfFilename}"`,
    ``,
    opts.pdfBuffer.toString("base64"),
    ``,
    `--${boundary}--`,
  ].join("\r\n");

  return mime;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface GmailDraftResult {
  draftId: string;
}

/**
 * Creates a Gmail draft in the info@fallingstarparties.com inbox addressed
 * to the client, with the finalization PDF attached and the Square invoice
 * link as a CTA button in the email body.
 */
export async function createFinalizationDraft(opts: {
  clientEmail: string;
  clientFirstName: string;
  pdfBuffer: Buffer;
  squareInvoiceUrl: string;
  baseUrl: string;
}): Promise<GmailDraftResult> {
  const auth = getOAuth2Client();
  const gmail = google.gmail({ version: "v1", auth });

  const fromAddress = "info@fallingstarparties.com";
  const subject = "Your Booking Finalization — Falling Star Parties";

  const htmlBody = buildFinalizationEmailHtml(
    opts.clientFirstName,
    opts.squareInvoiceUrl,
    opts.baseUrl
  );

  const mimeMessage = buildMimeMessage({
    to: opts.clientEmail,
    from: `Falling Star Parties <${fromAddress}>`,
    subject,
    htmlBody,
    pdfBuffer: opts.pdfBuffer,
    pdfFilename: "FallingStarParties-EventFinalization.pdf",
  });

  const encodedMessage = toBase64Url(mimeMessage);

  const draft = await gmail.users.drafts.create({
    userId: "me",
    requestBody: {
      message: { raw: encodedMessage },
    },
  });

  const draftId = draft.data.id;
  if (!draftId) throw new Error("Gmail draft created but no draft ID returned.");

  logger.info("Gmail finalization draft created", {
    draftId,
    clientEmail: opts.clientEmail,
  });

  return { draftId };
}
