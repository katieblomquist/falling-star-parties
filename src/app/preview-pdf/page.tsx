"use client";

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { mockEventData } from "./mockData";
import { PdfTemplate } from "@/app/api/generatePdf/pdfTemplate";
import { resolveCharacters } from "@/app/api/generatePdf/pdfData";

// PDFViewer uses browser APIs and must not be server-side rendered.
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

const BASE = "http://localhost:3000";
const charInfo = resolveCharacters(mockEventData.characterRealNames);

export default function PreviewPdfPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <PDFViewer style={{ width: "100%", height: "100vh", border: "none" }}>
      <PdfTemplate
        data={mockEventData}
        logoSrc={`${BASE}/logo.png`}
        charImageSrc={`${BASE}/pdfImages/${charInfo.imageFile}`}
      />
    </PDFViewer>
  );
}
