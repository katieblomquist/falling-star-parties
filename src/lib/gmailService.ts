import { google } from "googleapis";
import { readFileSync } from "fs";
import { join } from "path";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// OAuth2 client
// ---------------------------------------------------------------------------

function getOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Gmail OAuth2 credentials. Ensure GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are set."
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
  logoBase64: string
): string {
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Booking Finalization - Falling Star Parties</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Georgia',serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="background-color:#ffffff;padding:32px 40px 24px;">
              <img src="${logoSrc}" alt="Falling Star Parties" width="160" style="display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Title band -->
          <tr>
            <td align="center" style="background-color:#ffffff;padding:8px 40px 14px;">
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
              <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.8;">
                After you've reviewed it, please complete your event retainer via the link below
                within <strong>48 hours</strong> to secure your magical date. If you have any questions
                or need to request changes along the way, feel free to reach out - we're excited to
                help bring your vision to life!
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:4px 44px 28px;">
              <a href="${squareInvoiceUrl}"
                 style="display:inline-block;background-color:#343B95;color:#ffffff;font-size:13px;font-weight:bold;
                        text-decoration:none;padding:10px 24px;border-radius:50px;letter-spacing:0.5px;">
                Complete Event Retainer
              </a>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:24px 44px 32px;">
              <p style="margin:0 0 4px;font-size:15px;color:#444444;line-height:1.8;">Warm Wishes,</p>
              <p style="margin:0 0 2px;font-size:16px;font-weight:bold;color:#343B95;">Katelyn Winner</p>
              <p style="margin:0;font-size:14px;color:#888888;">Owner &#10024; Falling Star Parties LLC</p>
            </td>
          </tr>

        </table>

        <!-- Footer note -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:0;">
          <tr>
            <td align="center" style="background-color:#eeeef8;font-size:12px;color:#7878aa;padding:14px 20px;border-radius:0 0 8px 8px;">
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

/** RFC 2047 encode a header value so non-ASCII characters survive SMTP. */
function encodeSubject(subject: string): string {
  return `=?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`;
}

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
    `Subject: ${encodeSubject(opts.subject)}`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(opts.htmlBody).toString("base64"),
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
  clientLastName: string;
  eventDate: string;
  pdfBuffer: Buffer;
  squareInvoiceUrl: string;
}): Promise<GmailDraftResult> {
  const auth = getOAuth2Client();
  const gmail = google.gmail({ version: "v1", auth });

  const fromAddress = "info@fallingstarparties.com";
  const subject = "Your Booking Finalization - Falling Star Parties";

  // Embed logo as base64 data URI so it renders without Gmail's image blocking
  const logoBase64 = readFileSync(join(process.cwd(), "public", "logo.png")).toString("base64");

  const htmlBody = buildFinalizationEmailHtml(
    opts.clientFirstName,
    opts.squareInvoiceUrl,
    logoBase64
  );

  // Build a human-readable date string for the PDF filename (e.g. "July 13 2025")
  const dateLabel = opts.eventDate
    ? new Date(opts.eventDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      })
    : "Finalization";

  const pdfFilename = `${opts.clientLastName} Finalization - ${dateLabel}.pdf`;

  const mimeMessage = buildMimeMessage({
    to: opts.clientEmail,
    from: `Falling Star Parties <${fromAddress}>`,
    subject,
    htmlBody,
    pdfBuffer: opts.pdfBuffer,
    pdfFilename,
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
    pdfFilename,
  });

  return { draftId };
}

// ---------------------------------------------------------------------------
// Final invoice email HTML template
// ---------------------------------------------------------------------------

function buildFinalInvoiceEmailHtml(
  clientFirstName: string,
  squareInvoiceUrl: string,
  logoBase64: string
): string {
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Final Invoice - Falling Star Parties</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Georgia',serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="background-color:#ffffff;padding:32px 40px 24px;">
              <img src="${logoSrc}" alt="Falling Star Parties" width="160" style="display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Title band -->
          <tr>
            <td align="center" style="background-color:#ffffff;padding:8px 40px 14px;">
              <p style="margin:0;font-size:22px;font-weight:bold;color:#343B95;letter-spacing:0.5px;">
                Your Final Invoice
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
                Thank you for booking your magical celebration with Falling Star Parties! With your retainer secured,
                we're delighted to begin preparing the enchantment that will bring your child's dreams to life.
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.8;">
                If you have any questions or would like to request changes to your event before the big day, please
                don't hesitate to reach out — we're here to make every moment truly enchanting. We'll also reach out
                about one week before your celebration to confirm all the details and ensure everything is perfectly
                in place for your magical day.
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.8;">
                Your final invoice is linked below. This will need to be completed at least <strong>2 days prior to
                your event</strong>, though you're welcome to make partial payments at any time before then.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.8;">
                A quick note about gratuity — it's never required, but it is always a lovely way to show appreciation
                to your performer for bringing the magic to life! You can easily add a tip to your final invoice, or,
                if you prefer, you may offer a cash tip directly to your performer on the day of the event.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.8;">
                We can't wait to help make your celebration unforgettable!
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:4px 44px 28px;">
              <a href="${squareInvoiceUrl}"
                 style="display:inline-block;background-color:#343B95;color:#ffffff;font-size:13px;font-weight:bold;
                        text-decoration:none;padding:10px 24px;border-radius:50px;letter-spacing:0.5px;">
                Complete Final Balance
              </a>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:24px 44px 32px;">
              <p style="margin:0 0 4px;font-size:15px;color:#444444;line-height:1.8;">Pixie dust and warm wishes,</p>
              <p style="margin:0 0 2px;font-size:16px;font-weight:bold;color:#343B95;">Katelyn</p>
              <p style="margin:0;font-size:14px;color:#888888;">Owner &#10024; Falling Star Parties LLC</p>
            </td>
          </tr>

        </table>

        <!-- Footer note -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:0;">
          <tr>
            <td align="center" style="background-color:#eeeef8;font-size:12px;color:#7878aa;padding:14px 20px;border-radius:0 0 8px 8px;">
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
// Public API — final invoice draft
// ---------------------------------------------------------------------------

/**
 * Creates a Gmail draft for the final balance invoice, addressed to the
 * client with the Square final invoice link as a CTA button. The same
 * finalization PDF is re-attached for reference.
 */
export async function createFinalInvoiceDraft(opts: {
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  eventDate: string;
  pdfBuffer: Buffer;
  squareInvoiceUrl: string;
}): Promise<GmailDraftResult> {
  const auth = getOAuth2Client();
  const gmail = google.gmail({ version: "v1", auth });

  const fromAddress = "info@fallingstarparties.com";
  const subject = "Your Final Invoice - Falling Star Parties";

  const logoBase64 = readFileSync(join(process.cwd(), "public", "logo.png")).toString("base64");

  const htmlBody = buildFinalInvoiceEmailHtml(
    opts.clientFirstName,
    opts.squareInvoiceUrl,
    logoBase64
  );

  const dateLabel = opts.eventDate
    ? new Date(opts.eventDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      })
    : "Event";

  const pdfFilename = `${opts.clientLastName} Finalization - ${dateLabel}.pdf`;

  const mimeMessage = buildMimeMessage({
    to: opts.clientEmail,
    from: `Falling Star Parties <${fromAddress}>`,
    subject,
    htmlBody,
    pdfBuffer: opts.pdfBuffer,
    pdfFilename,
  });

  const encodedMessage = toBase64Url(mimeMessage);

  const draft = await gmail.users.drafts.create({
    userId: "me",
    requestBody: {
      message: { raw: encodedMessage },
    },
  });

  const draftId = draft.data.id;
  if (!draftId) throw new Error("Gmail final invoice draft created but no draft ID returned.");

  logger.info("Gmail final invoice draft created", {
    draftId,
    clientEmail: opts.clientEmail,
    pdfFilename,
  });

  return { draftId };
}

// ---------------------------------------------------------------------------
// Pre-event confirmation email HTML template
// ---------------------------------------------------------------------------

/**
 * Returns a warm, human-readable sentence for a given extra add-on title.
 * Returns null for extras that don't warrant a call-out (e.g. free Storytime
 * already included in the package description).
 */
function extrasConfirmationSentence(
  title: string,
  childName: string,
  numChildren: number
): string | null {
  switch (title) {
    case "Gift Bags":
      return `We'll also have ${numChildren} gift bag${numChildren !== 1 ? "s" : ""} ready for your little guests — each filled with a touch of magic, plus a special Deluxe Princess Set for ${childName || "the birthday royal"}!`;
    case "Character Cards":
      return `Each of your guests will get to take home a signed character card — a little keepsake from the magic!`;
    case "Storybook Keepsake":
      return `We'll have a special storybook ready for ${childName || "your little one"}, personally signed by her princess — a treasure she'll love to revisit again and again!`;
    case "Deluxe Storybook Keepsake":
      return `We'll have a deluxe storybook ready for ${childName || "your little one"}, filled with over 10 magical princess stories and signed by her princess — a keepsake she'll cherish!`;
    case "Deluxe Princess Set":
      return `We'll have a sparkling rhinestone crown and themed princess sash ready to make ${childName || "your birthday royal"} feel every bit the princess she is!`;
    case "Interactive Storytime":
      return `We have a wonderful interactive story time planned where your little guests will get to join right in the adventure!`;
    case "Storytime":
      // Free, already woven into the package — no need to call out separately
      return null;
    default:
      return `We also have your ${title} add-on all set for the big day!`;
  }
}

function buildPreEventConfirmationEmailHtml(opts: {
  clientFirstName: string;
  childName: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  characterNames: string;
  address: string;
  extrasSentences: string[];
  invoiceDueDateStr: string;
  finalInvoiceUrl: string | null;
  logoBase64: string;
}): string {
  const {
    clientFirstName,
    childName,
    eventDate,
    eventStartTime,
    eventEndTime,
    characterNames,
    address,
    extrasSentences,
    invoiceDueDateStr,
    finalInvoiceUrl,
    logoBase64,
  } = opts;

  const logoSrc = `data:image/png;base64,${logoBase64}`;
  const childDisplay = childName || "your little one";

  const extrasHtml = extrasSentences.length > 0
    ? extrasSentences
        .map(
          (s) =>
            `<p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.8;">${s}</p>`
        )
        .join("\n              ")
    : "";

  const invoiceSection = finalInvoiceUrl
    ? `
          <!-- Invoice reminder -->
          <tr>
            <td style="padding:0 44px 10px;">
              <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.8;">
                Your final invoice is linked below. Please complete it by
                <strong>${invoiceDueDateStr} at 6:00 PM</strong> so we can ensure every
                detail is ready for your magical day.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.8;">
                A quick note about gratuity — it's never required, but it is always a lovely
                way to show appreciation to your performer for bringing the magic to life!
                You can easily add a tip to your final invoice, or, if you prefer, you may
                offer a cash tip directly to your performer on the day of the event.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:4px 44px 28px;">
              <a href="${finalInvoiceUrl}"
                 style="display:inline-block;background-color:#343B95;color:#ffffff;font-size:13px;font-weight:bold;
                        text-decoration:none;padding:10px 24px;border-radius:50px;letter-spacing:0.5px;">
                Complete Final Payment
              </a>
            </td>
          </tr>`
    : `
          <!-- Invoice already paid -->
          <tr>
            <td style="padding:0 44px 28px;">
              <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.8;">
                Your final invoice has been paid — you're all set! We are so excited to
                celebrate this special day with ${childDisplay}.
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.8;">
                A quick note about gratuity — it's never required, but it is always a lovely
                way to show appreciation to your performer for bringing the magic to life!
                You are welcome to offer a cash tip directly to your performer on the day
                of the event.
              </p>
            </td>
          </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Event is Almost Here! - Falling Star Parties</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Georgia',serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="background-color:#ffffff;padding:32px 40px 24px;">
              <img src="${logoSrc}" alt="Falling Star Parties" width="160" style="display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Title band -->
          <tr>
            <td align="center" style="background-color:#ffffff;padding:8px 40px 14px;">
              <p style="margin:0;font-size:22px;font-weight:bold;color:#343B95;letter-spacing:0.5px;">
                Your Event is Coming Up!
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
                We can hardly wait to celebrate ${childDisplay} for their special day on
                <strong>${eventDate}</strong> from <strong>${eventStartTime}&nbsp;&ndash;&nbsp;${eventEndTime}</strong>
                with ${characterNames} at your home!
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#555555;line-height:1.8;">
                <em>${address}</em>
              </p>
              ${extrasHtml}
              <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.8;">
                As always, if you have any questions or need to request changes before the big day,
                just send a message our way — we're here to make sure your celebration is nothing
                short of enchanting.
              </p>
            </td>
          </tr>
          ${invoiceSection}

          <!-- Signature -->
          <tr>
            <td style="padding:24px 44px 32px;">
              <p style="margin:0 0 4px;font-size:15px;color:#444444;line-height:1.8;">Pixie dust and warm wishes,</p>
              <p style="margin:0 0 2px;font-size:16px;font-weight:bold;color:#343B95;">Katelyn</p>
              <p style="margin:0;font-size:14px;color:#888888;">Owner &#10024; Falling Star Parties LLC</p>
            </td>
          </tr>

        </table>

        <!-- Footer note -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:0;">
          <tr>
            <td align="center" style="background-color:#eeeef8;font-size:12px;color:#7878aa;padding:14px 20px;border-radius:0 0 8px 8px;">
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
// Public API — pre-event confirmation draft
// ---------------------------------------------------------------------------

/**
 * Creates a Gmail draft in the info@fallingstarparties.com inbox for the
 * 1-week pre-event confirmation. Includes a summary of event details and,
 * if the final invoice is still unpaid, a CTA link to complete payment.
 * The draft is HTML-only — no PDF attachment (the client already has their
 * finalization letter from the earlier email).
 */
export async function createPreEventConfirmationDraft(opts: {
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  childName: string;
  eventDateIso: string;
  packageDurationMinutes: number;
  characterNames: string;
  address: string;
  extrasTitles: string[];
  numChildren: number;
  finalInvoiceUrl: string | null;
}): Promise<GmailDraftResult> {
  const auth = getOAuth2Client();
  const gmail = google.gmail({ version: "v1", auth });

  const fromAddress = "info@fallingstarparties.com";
  const subject = "Your event is almost here! — Falling Star Parties";

  const logoBase64 = readFileSync(join(process.cwd(), "public", "logo.png")).toString("base64");

  // Format event date and times
  const eventDate = new Date(opts.eventDateIso);

  const eventDateStr = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });

  const eventStartTimeStr = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });

  const eventEndDate = new Date(eventDate.getTime() + opts.packageDurationMinutes * 60 * 1000);
  const eventEndTimeStr = eventEndDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });

  // Invoice due date: 2 days before event
  const invoiceDueDate = new Date(eventDate.getTime() - 2 * 24 * 60 * 60 * 1000);
  const invoiceDueDateStr = invoiceDueDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });

  // Build warm extras sentences
  const extrasSentences = opts.extrasTitles
    .map((title) => extrasConfirmationSentence(title, opts.childName, opts.numChildren))
    .filter((s): s is string => s !== null);

  const htmlBody = buildPreEventConfirmationEmailHtml({
    clientFirstName: opts.clientFirstName,
    childName: opts.childName,
    eventDate: eventDateStr,
    eventStartTime: eventStartTimeStr,
    eventEndTime: eventEndTimeStr,
    characterNames: opts.characterNames,
    address: opts.address,
    extrasSentences,
    invoiceDueDateStr,
    finalInvoiceUrl: opts.finalInvoiceUrl,
    logoBase64,
  });

  // HTML-only MIME message (no PDF attachment)
  const boundary = `----=_Part_${Date.now()}`;
  const mime = [
    `MIME-Version: 1.0`,
    `To: ${opts.clientEmail}`,
    `From: Falling Star Parties <${fromAddress}>`,
    `Subject: ${encodeSubject(subject)}`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(htmlBody).toString("base64"),
    ``,
    `--${boundary}--`,
  ].join("\r\n");

  const encodedMessage = toBase64Url(mime);

  const draft = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw: encodedMessage } },
  });

  const draftId = draft.data.id;
  if (!draftId) throw new Error("Pre-event confirmation draft created but no draft ID returned.");

  logger.info("Gmail pre-event confirmation draft created", {
    draftId,
    clientEmail: opts.clientEmail,
    invoicePaid: opts.finalInvoiceUrl === null,
  });

  return { draftId };
}
