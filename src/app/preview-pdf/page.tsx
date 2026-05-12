"use client";

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { mockEventData } from "./mockData";
import { resolveCharacters } from "@/app/api/generatePdf/pdfData";

const BASE = "http://localhost:3000";

// All @react-pdf/renderer imports are inside this dynamic callback so webpack
// never tries to statically bundle the ESM-only package. ssr:false is required
// because PDFViewer uses browser APIs.
const PdfViewerSection = dynamic(
  async () => {
    const { PDFViewer } = await import("@react-pdf/renderer");
    const { PdfTemplate } = await import("@/app/api/generatePdf/pdfTemplate");
    const charInfo = resolveCharacters(mockEventData.characterRealNames);

    return function PdfViewerSection() {
      return (
        <PDFViewer style={{ width: "100%", height: "100vh", border: "none" }}>
          <PdfTemplate
            data={mockEventData}
            logoSrc={`${BASE}/logo.png`}
            charImageSrc={`${BASE}/pdfImages/${charInfo.imageFile}`}
          />
        </PDFViewer>
      );
    };
  },
  { ssr: false }
);

export default function PreviewPdfPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <PdfViewerSection />;
}
