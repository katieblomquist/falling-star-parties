import { SquareClient, SquareEnvironment } from "square";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Square client
// ---------------------------------------------------------------------------

function getSquareClient() {
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
// Find or create a Square customer
// ---------------------------------------------------------------------------

async function findOrCreateCustomer(
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
      deliveryMethod: "EMAIL",
      title: "Non-Refundable Event Retainer",
      description:
        "A $50 non-refundable retainer to hold your Falling Star Parties event date. The remaining balance is due on the day of your event.",
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
