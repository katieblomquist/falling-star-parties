import { SquareClient, SquareEnvironment } from "square";
import type { Currency } from "square";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";
import { packages, extras } from "@/app/content";
import type { PdfEventData } from "@/app/api/generatePdf/pdfData";

// ---------------------------------------------------------------------------
// Square client
// ---------------------------------------------------------------------------

export function getSquareClient() {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("Missing SQUARE_ACCESS_TOKEN");

  return new SquareClient({
    token,
    environment: SquareEnvironment.Production,
  });
}

// ---------------------------------------------------------------------------
// Find the "Non-Refundable Event Retainer" catalog item variation ID
// ---------------------------------------------------------------------------

async function getRetainerVariationId(client: SquareClient): Promise<string> {
  const response = await client.catalog.searchItems({
    textFilter: "Non-Refundable Event Retainer",
  });

  const items = response.items;
  if (!items || items.length === 0) {
    throw new Error(
      'Square catalog item "Non-Refundable Event Retainer" not found. Check the item name in your Square catalog.'
    );
  }

  const item = items[0] as unknown as Record<string, unknown>;
  const itemData = item.itemData as { variations?: Array<{ id?: string }> } | undefined;
  const variationId = itemData?.variations?.[0]?.id;
  if (!variationId) {
    throw new Error("Retainer catalog item has no variation ID.");
  }

  return variationId;
}

// ---------------------------------------------------------------------------
// Find or create a Square customer (exported for use in final invoice flow)
// ---------------------------------------------------------------------------

export async function findOrCreateCustomer(
  client: SquareClient,
  firstName: string,
  lastName: string,
  email: string
): Promise<string> {
  // Search by email first
  const searchResult = await client.customers.search({
    query: {
      filter: {
        emailAddress: { exact: email },
      },
    },
  });

  const existing = searchResult.customers?.[0];
  if (existing?.id) {
    logger.info("Found existing Square customer", { customerId: existing.id, email });
    return existing.id;
  }

  // Create new customer
  const createResult = await client.customers.create({
    idempotencyKey: randomUUID(),
    givenName: firstName,
    familyName: lastName,
    emailAddress: email,
  });

  const customerId = createResult.customer?.id;
  if (!customerId) throw new Error("Failed to create Square customer.");

  logger.info("Created Square customer", { customerId, email });
  return customerId;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SquareInvoiceResult {
  invoiceId: string;
  invoiceUrl: string;
}

/**
 * Creates a $50 Non-Refundable Event Retainer invoice in Square for the
 * given client. The invoice is due 72 hours from now with a day-of reminder.
 */
export async function createRetainerInvoice(
  clientFirstName: string,
  clientLastName: string,
  clientEmail: string
): Promise<SquareInvoiceResult> {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) throw new Error("Missing SQUARE_LOCATION_ID");

  const squareClient = getSquareClient();

  // Resolve catalog item + customer in parallel
  const [variationId, customerId] = await Promise.all([
    getRetainerVariationId(squareClient),
    findOrCreateCustomer(squareClient, clientFirstName, clientLastName, clientEmail),
  ]);

  // Create order
  const orderResult = await squareClient.orders.create({
    order: {
      locationId,
      customerId,
      lineItems: [
        {
          quantity: "1",
          catalogObjectId: variationId,
        },
      ],
    },
    idempotencyKey: randomUUID(),
  });

  const orderId = orderResult.order?.id;
  if (!orderId) throw new Error("Failed to create Square order.");

  // Due date: 72 hours from now (Square uses YYYY-MM-DD)
  const dueDate = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const dueDateStr = dueDate.toISOString().split("T")[0];

  // Create invoice
  const invoiceResult = await squareClient.invoices.create({
    invoice: {
      locationId,
      orderId,
      primaryRecipient: { customerId },
      paymentRequests: [
        {
          requestType: "BALANCE",
          dueDate: dueDateStr,
          reminders: [
            {
              relativeScheduledDays: 0,
              message: `Friendly reminder: your $50 event retainer for Falling Star Parties is due today. Please complete it to secure your magical date!`,
            },
          ],
        },
      ],
      deliveryMethod: "SHARE_MANUALLY",
      title: "Non-Refundable Event Retainer",
      description:
        "A $50 non-refundable retainer to hold your Falling Star Parties event date. The remaining balance is due 48 hours before your event.",
      acceptedPaymentMethods: {
        card: true,
        squareGiftCard: false,
        bankAccount: false,
        buyNowPayLater: false,
      },
    },
    idempotencyKey: randomUUID(),
  });

  const invoice = invoiceResult.invoice;
  if (!invoice?.id) throw new Error("Failed to create Square invoice.");

  // Publish the invoice so the client receives it and the link is live
  const publishResult = await squareClient.invoices.publish({
    invoiceId: invoice.id,
    version: invoice.version ?? 0,
    idempotencyKey: randomUUID(),
  });

  const publishedInvoice = publishResult.invoice;
  const invoiceUrl = publishedInvoice?.publicUrl;

  if (!invoiceUrl) throw new Error("Invoice published but no public URL returned.");

  logger.info("Square retainer invoice created and published", {
    invoiceId: invoice.id,
    customerId,
    dueDateStr,
    invoiceUrl,
  });

  return { invoiceId: invoice.id, invoiceUrl };
}

// ---------------------------------------------------------------------------
// Final balance invoice — built entirely from content.ts prices, no catalog
// ---------------------------------------------------------------------------

/**
 * Creates the final balance invoice for an event. Line items are derived
 * directly from content.ts so pricing stays in one place. The $50 retainer
 * already paid is subtracted from the base package price.
 *
 * Tipping and partial payments are both enabled. Due date is set to 48 hours
 * before the event start time.
 */
export async function createFinalInvoice(
  data: PdfEventData,
  clientEmail: string,
  eventDateIso: string
): Promise<SquareInvoiceResult> {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) throw new Error("Missing SQUARE_LOCATION_ID");

  const squareClient = getSquareClient();

  const pkg = packages.find((p) => p.id === data.packageId);
  if (!pkg) throw new Error(`Unknown packageId: ${data.packageId}`);

  // Find or create customer
  const customerId = await findOrCreateCustomer(
    squareClient,
    data.clientFirstName,
    data.clientLastName,
    clientEmail
  );

  // ---------------------------------------------------------------------------
  // Build line items
  // ---------------------------------------------------------------------------

  type LineItem = { name: string; quantity: string; basePriceMoney: { amount: bigint; currency: Currency } };
  const lineItems: LineItem[] = [];

  const toCents = (dollars: number) => BigInt(Math.round(dollars * 100));
  const USD: Currency = "USD";

  // Base package minus the $50 retainer already collected
  const baseAmount = pkg.cost - 50;
  if (baseAmount > 0) {
    lineItems.push({
      name: `${pkg.title} Package (base visit)`,
      quantity: "1",
      basePriceMoney: { amount: toCents(baseAmount), currency: USD },
    });
  }

  // Additional characters — covers every character beyond the first
  const additionalCharacterCount = data.characterRealNames.length - 1;
  if (additionalCharacterCount > 0 && pkg.additionalCharacterCost > 0) {
    lineItems.push({
      name: `Additional Character${additionalCharacterCount > 1 ? "s" : ""} (×${additionalCharacterCount})`,
      quantity: String(additionalCharacterCount),
      basePriceMoney: { amount: toCents(pkg.additionalCharacterCost), currency: USD },
    });
  }

  // Extras
  for (const title of data.extrasTitles) {
    const extra = extras.find((e) => e.title === title);
    if (!extra || extra.cost === 0) continue; // free extras (e.g. basic Storytime) not invoiced

    if (title === "Gift Bags" || title === "Character Cards") {
      // Per-child pricing
      const numChildren = data.numChildren || 1;
      lineItems.push({
        name: `${title} (${numChildren} ${numChildren === 1 ? "child" : "children"})`,
        quantity: String(numChildren),
        basePriceMoney: { amount: toCents(extra.cost), currency: USD },
      });
    } else {
      lineItems.push({
        name: title,
        quantity: "1",
        basePriceMoney: { amount: toCents(extra.cost), currency: USD },
      });
    }
  }

  // Travel fee (dynamic — stored on Notion page)
  if (data.travelFee > 0) {
    lineItems.push({
      name: "Travel Fee",
      quantity: "1",
      basePriceMoney: { amount: toCents(data.travelFee), currency: USD },
    });
  }

  // ---------------------------------------------------------------------------
  // Create order
  // ---------------------------------------------------------------------------

  const orderResult = await squareClient.orders.create({
    order: {
      locationId,
      customerId,
      lineItems,
    },
    idempotencyKey: randomUUID(),
  });

  const orderId = orderResult.order?.id;
  if (!orderId) throw new Error("Failed to create Square order for final invoice.");

  // ---------------------------------------------------------------------------
  // Due date: 48 hours before the event start time
  // ---------------------------------------------------------------------------

  const eventDate = new Date(eventDateIso);
  const dueDate = new Date(eventDate.getTime() - 48 * 60 * 60 * 1000);
  // If due date is in the past (e.g. test bookings), fall back to 48 hrs from now
  const effectiveDueDate =
    dueDate > new Date() ? dueDate : new Date(Date.now() + 48 * 60 * 60 * 1000);
  const dueDateStr = effectiveDueDate.toISOString().split("T")[0];

  // ---------------------------------------------------------------------------
  // Create and publish invoice
  // ---------------------------------------------------------------------------

  const invoiceResult = await squareClient.invoices.create({
    invoice: {
      locationId,
      orderId,
      primaryRecipient: { customerId },
      paymentRequests: [
        {
          requestType: "BALANCE",
          dueDate: dueDateStr,
          tippingEnabled: true,
          reminders: [
            {
              relativeScheduledDays: -4,
              message:
                "Friendly reminder: your final balance for your Falling Star Parties event is due in 4 days. Please complete it to confirm your magical celebration!",
            },
            {
              relativeScheduledDays: -2,
              message:
                "Friendly reminder: your final balance for your Falling Star Parties event is due in 2 days. Please complete it to confirm your magical celebration!",
            },
            {
              relativeScheduledDays: -1,
              message:
                "Friendly reminder: your final balance for your Falling Star Parties event is due tomorrow. Please complete it to confirm your magical celebration!",
            },
            {
              relativeScheduledDays: 0,
              message:
                "Your Falling Star Parties final balance is due today! Please complete your payment so we can't wait to make your event magical.",
            },
          ],
        },
      ],
      deliveryMethod: "SHARE_MANUALLY",
      title: "Final Balance — Falling Star Parties",
      description:
        "Final balance for your Falling Star Parties event. Tipping for your performer is appreciated but never required!",
      acceptedPaymentMethods: {
        card: true,
        squareGiftCard: false,
        bankAccount: false,
        buyNowPayLater: false,
      },
    },
    idempotencyKey: randomUUID(),
  });

  const invoice = invoiceResult.invoice;
  if (!invoice?.id) throw new Error("Failed to create Square final invoice.");

  const publishResult = await squareClient.invoices.publish({
    invoiceId: invoice.id,
    version: invoice.version ?? 0,
    idempotencyKey: randomUUID(),
  });

  const publishedInvoice = publishResult.invoice;
  const invoiceUrl = publishedInvoice?.publicUrl;
  if (!invoiceUrl) throw new Error("Final invoice published but no public URL returned.");

  logger.info("Square final invoice created and published", {
    invoiceId: invoice.id,
    customerId,
    dueDateStr,
    invoiceUrl,
    lineItemCount: lineItems.length,
  });

  return { invoiceId: invoice.id, invoiceUrl };
}

// ---------------------------------------------------------------------------
// Invoice paid status check — used by pre-event reminder automation
// ---------------------------------------------------------------------------

/**
 * Returns true if the given Square invoice has been fully paid.
 * A status of "PAID" means the full balance was collected. Any other status
 * (UNPAID, PARTIALLY_PAID, SCHEDULED, etc.) is treated as unpaid.
 */
export async function getInvoicePaidStatus(invoiceId: string): Promise<boolean> {
  const squareClient = getSquareClient();
  const result = await squareClient.invoices.get({ invoiceId });
  const status = result.invoice?.status;

  logger.info("Checked Square invoice paid status", { invoiceId, status });

  return status === "PAID";
}
