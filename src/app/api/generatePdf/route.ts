import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Client } from "@notionhq/client";
import React from "react";
import fs from "fs";
import path from "path";
import { PdfTemplate } from "./pdfTemplate";
import { PdfEventData, resolveCharacters } from "./pdfData";
import { packages, characterNameMap, dresses, extras } from "@/app/content";
import { logger } from "@/lib/logger";

function imageToDataUrl(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext};base64,${buffer.toString("base64")}`;
}

// ---------------------------------------------------------------------------
// Notion → PdfEventData extraction
// ---------------------------------------------------------------------------

type NotionPage = Awaited<ReturnType<InstanceType<typeof Client>["pages"]["retrieve"]>>;

function getTextProp(props: Record<string, unknown>, key: string): string {
  const p = props[key] as { rich_text?: Array<{ plain_text: string }> } | undefined;
  return p?.rich_text?.[0]?.plain_text ?? "";
}

function getTitleProp(props: Record<string, unknown>, key: string): string {
  const p = props[key] as { title?: Array<{ plain_text: string }> } | undefined;
  return p?.title?.[0]?.plain_text ?? "";
}

function getSelectProp(props: Record<string, unknown>, key: string): string {
  const p = props[key] as { select?: { name: string } } | undefined;
  return p?.select?.name ?? "";
}

function getMultiSelectProp(props: Record<string, unknown>, key: string): string[] {
  const p = props[key] as { multi_select?: Array<{ name: string }> } | undefined;
  return p?.multi_select?.map((s) => s.name) ?? [];
}

function getNumberProp(props: Record<string, unknown>, key: string): number {
  const p = props[key] as { number?: number } | undefined;
  return p?.number ?? 0;
}

function getDateProp(props: Record<string, unknown>, key: string): string {
  const p = props[key] as { date?: { start: string } } | undefined;
  return p?.date?.start ?? "";
}

function getEmailProp(props: Record<string, unknown>, key: string): string {
  const p = props[key] as { email?: string } | undefined;
  return p?.email ?? "";
}

export function notionPageToPdfData(page: NotionPage): PdfEventData & { clientEmail: string; clientFirstName: string } {
  const props = (page as Record<string, unknown>).properties as Record<string, unknown>;

  const clientFullName = getTitleProp(props, "Client name");
  const clientFirstName = clientFullName.split(" ")[0] ?? clientFullName;
  const clientLastName = clientFullName.split(" ").slice(1).join(" ") || "";
  const clientEmail = getEmailProp(props, "Email");

  const packageName = getSelectProp(props, "Event Package");
  // Match package by formatted name or raw title
  const pkg = packages.find(
    (p) => p.title === packageName || `${p.title} - ${p.duration.replace(" Minutes", " Min")}` === packageName
  );
  const packageId = pkg?.id ?? 0;

  const eventType = getSelectProp(props, "Event Type");
  const characterRealNames = getMultiSelectProp(props, "Characters");
  const dressNamesProp = getMultiSelectProp(props, "Dress");
  const extrasTitles = getMultiSelectProp(props, "Extras");
  const travelFee = getNumberProp(props, "Travel Fee");

  return {
    clientFirstName,
    clientLastName,
    clientEmail,
    childName: getTextProp(props, "Child's Name"),
    childAge: getNumberProp(props, "Child's Age") || null,
    dateTime: getDateProp(props, "Event date"),
    address: getTextProp(props, "Location"),
    locationPref: getSelectProp(props, "Location Pref"),
    eventType,
    numChildren: getNumberProp(props, "Number of Children"),
    packageId,
    characterRealNames,
    dressNames: dressNamesProp,
    extrasTitles,
    travelFee,
  };
}

// ---------------------------------------------------------------------------
// Core render function — shared with finalize route
// ---------------------------------------------------------------------------

export async function renderPdfBuffer(
  data: PdfEventData
): Promise<Buffer> {
  const publicDir = path.join(process.cwd(), "public");
  const charInfo = resolveCharacters(data.characterRealNames);

  const logoSrc = imageToDataUrl(path.join(publicDir, "logo.png"));
  const charImageSrc = imageToDataUrl(path.join(publicDir, "pdfImages", charInfo.imageFile));

  const element = React.createElement(PdfTemplate, { data, logoSrc, charImageSrc });
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}

// ---------------------------------------------------------------------------
// API route — manual / standalone use
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || token !== process.env.PDF_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!pageId) {
    return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
  }

  const notionKey = process.env.NOTION_KEY;
  if (!notionKey) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  try {
    const notion = new Client({ auth: notionKey });
    const page = await notion.pages.retrieve({ page_id: pageId });
    const data = notionPageToPdfData(page);

    const pdfBuffer = await renderPdfBuffer(data);

    // Append a note to the Notion page
    await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: `PDF generated — ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}`,
                },
              },
            ],
          },
        },
      ],
    });

    logger.info("PDF generated successfully", { pageId });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="FallingStarParties-Finalization.pdf"`,
      },
    });
  } catch (error) {
    logger.error("PDF generation failed", {
      pageId,
      errorMessage: error instanceof Error ? error.message : String(error),
    }, error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
