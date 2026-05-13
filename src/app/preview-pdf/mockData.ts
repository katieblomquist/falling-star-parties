import { PdfEventData } from "@/app/api/generatePdf/pdfData";

// Realistic fixture: Elsa + Anna, Sparkle 60-min birthday party,
// Storybook Keepsake add-on, $25 travel fee.
export const mockEventData: PdfEventData = {
  clientFirstName: "Sarah",
  clientLastName: "Johnson",
  childName: "Emma",
  childAge: 6,
  dateTime: "2026-06-14T14:00:00",
  address: "123 Maple Street, Annapolis, MD 21401",
  locationPref: "",
  eventType: "Birthday Party",
  numChildren: 10,
  packageId: 1, // Sparkle - 60 Min
  characterRealNames: ["Elsa", "Anna"],
  dressNames: [],
  extrasTitles: ["Storybook Keepsake"],
  travelFee: 25,
  phone: "(410) 555-1234",
  assignedPerformers: [],
};
