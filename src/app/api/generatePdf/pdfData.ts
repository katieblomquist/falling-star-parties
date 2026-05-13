import { characters, packages, extras, dresses } from "@/app/content";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PdfEventData {
  // Client / event
  clientFirstName: string;
  clientLastName: string;
  childName: string;
  childAge: number | null;
  dateTime: string;
  address: string;
  locationPref: string;
  eventType: string;
  numChildren: number;

  // Package
  packageId: number;

  // Characters (real names e.g. "Elsa")
  characterRealNames: string[];

  // Dress selections (may include "(Character)" suffix)
  dressNames: string[];

  // Extras (titles)
  extrasTitles: string[];

  // Travel fee (0 = omit)
  travelFee: number;
}

export interface PdfPricingLine {
  label: string;
  amount: number;
}

export interface PdfPackageInfo {
  title: string;
  duration: string;
  activities: string[];
  basePrice: number;
}

export interface PdfCharacterInfo {
  /** Generic display name shown on PDF (e.g. "Ice Queen") */
  displayName: string;
  /** Image file name inside public/pdfImages/ */
  imageFile: string;
}

// ---------------------------------------------------------------------------
// Character → display name (Notion real name → PDF generic name)
// ---------------------------------------------------------------------------

const REAL_TO_DISPLAY: Record<string, string> = {
  Elsa: "Ice Queen",
  Anna: "Snow Princess",
  Ariel: "Mermaid Princess",
  Belle: "Rose Princess",
  Cinderella: "Glass Slipper Princess",
  Aurora: "Sleeping Princess",
  Rapunzel: "Tower Princess",
  Glinda: "Bubble Queen",
};

// ---------------------------------------------------------------------------
// Character combination → PDF image file
// ---------------------------------------------------------------------------

function characterImageFile(realNames: string[]): string {
  const sorted = [...realNames].sort();

  if (sorted.length === 1) {
    const map: Record<string, string> = {
      Elsa: "elsa-pdf.png",
      Anna: "anna-pdf.png",
      Ariel: "ariel-pdf.png",
      Belle: "belle-pdf.png",
      Cinderella: "cinerella-pdf.png", // intentional typo — matches actual file
      Aurora: "aurora-pdf.png",
      Rapunzel: "rapunzel-pdf.png",
      Glinda: "multi-character-pdf.png",
    };
    return map[sorted[0]] ?? "multi-character-pdf.png";
  }

  if (sorted.length === 2 && sorted[0] === "Anna" && sorted[1] === "Elsa") {
    return "elsa-anna-pdf.png";
  }

  return "multi-character-pdf.png";
}

// ---------------------------------------------------------------------------
// Package → activities (birthday parties only list; meet & greet is simpler)
// ---------------------------------------------------------------------------

const BIRTHDAY_ACTIVITIES: Record<string, string[]> = {
  Dream: [
    "Enchanted Story Time",
    "Royal Princess Lessons & Coronation Ceremony",
    "Magical Photo Opportunity",
    "Happy Birthday Song",
  ],
  Sparkle: [
    "Enchanted Story Time",
    "Royal Princess Lessons & Coronation Ceremony",
    "Whimsical Party Games (Such as Simon Says, Hide-and-Seek, Duck Duck Goose)",
    "Magical Photo Opportunity",
    "Happy Birthday Song",
  ],
  Shine: [
    "Enchanted Story Time",
    "Royal Princess Lessons & Coronation Ceremony",
    "Whimsical Party Games (Such as Simon Says, Hide-and-Seek, Duck Duck Goose)",
    "Fairytale Face Painting",
    "Bubble Play",
    "Magical Photo Opportunity",
    "Happy Birthday Song",
  ],
};

const MEETGREET_ACTIVITIES = [
  "Whimsical Encounters",
  "Smiles and Warm Hugs",
  "Magical Photo Opportunities",
];

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------

/** Resolve character display info for PDF header. */
export function resolveCharacters(realNames: string[]): PdfCharacterInfo {
  const displayNames = realNames
    .map((n) => REAL_TO_DISPLAY[n] ?? n)
    .join(" & ");

  return {
    displayName: displayNames,
    imageFile: characterImageFile(realNames),
  };
}

/** Resolve package info from packageId + eventType. */
export function resolvePackage(packageId: number, eventType: string): PdfPackageInfo {
  // packageId of -1 means the Notion "Event Package" / "Event Type" fields
  // did not match any known package — surface a clear label instead of
  // silently rendering the wrong package content.
  if (packageId === -1) {
    return {
      title: "Unknown Package — check Notion Event Package & Event Type fields",
      duration: "",
      activities: [],
      basePrice: 0,
    };
  }

  const pkg = packages.find((p) => p.id === packageId);
  if (!pkg) {
    return { title: "Event", duration: "", activities: [], basePrice: 0 };
  }

  const activities =
    BIRTHDAY_ACTIVITIES[pkg.title] ??
    (pkg.title.includes("Meet") ? MEETGREET_ACTIVITIES : []);

  return {
    title: pkg.title,
    duration: pkg.duration,
    activities,
    basePrice: pkg.cost,
  };
}

/** Build the pricing breakdown lines. */
export function buildPricingLines(data: PdfEventData): {
  lines: PdfPricingLine[];
  total: number;
} {
  const pkg = packages.find((p) => p.id === data.packageId);
  if (!pkg) return { lines: [], total: 0 };

  const lines: PdfPricingLine[] = [];

  // Base price
  lines.push({ label: "Base Visit Price", amount: pkg.cost });

  // Additional character (if 2+)
  if (data.characterRealNames.length >= 2) {
    lines.push({
      label: "Second Character Add-On",
      amount: pkg.additionalCharacterCost,
    });
  }

  // Extras
  for (const title of data.extrasTitles) {
    const extra = extras.find((e) => e.title === title);
    if (!extra) continue;

    // Per-child extras
    if (title === "Gift Bags" || title === "Character Cards") {
      const perChild = extra.cost * (data.numChildren || 1);
      lines.push({ label: `${title} (${data.numChildren} children)`, amount: perChild });
    } else if (extra.cost > 0) {
      lines.push({ label: title, amount: extra.cost });
    }
    // Free extras (cost === 0) are listed in activities, not pricing
  }

  // Travel fee
  if (data.travelFee > 0) {
    lines.push({ label: "Travel Fee", amount: data.travelFee });
  }

  const total = lines.reduce((sum, l) => sum + l.amount, 0);

  return { lines, total };
}

/** Format a dateTime string for display on the PDF. */
export function formatPdfDate(dateTime: string): string {
  return new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

export function formatPdfTime(dateTime: string): string {
  return new Date(dateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
}

/** Build the dress note string if there are dress selections. */
export function buildDressNote(dressNames: string[]): string | null {
  if (!dressNames.length) return null;
  return `Dress: ${dressNames.join(", ")}`;
}

/**
 * Build the Characters bullet value, combining display names with dress
 * assignments per character.
 *
 * Output examples:
 *   "Ice Queen & Snow Princess (Ice Queen - Elements Dress, Snow Princess - Queen Dress)"
 *   "Ice Queen"                          ← single character, no dress
 *   "Ice Queen (Ice Queen - Ice Dress)"  ← single character with dress
 */
export function buildCharacterBulletValue(
  realNames: string[],
  dressNames: string[]
): string {
  const displayNames = realNames.map((n) => REAL_TO_DISPLAY[n] ?? n);
  const groupName = displayNames.join(" & ");

  if (!dressNames.length) return groupName;

  // Associate each dress name with a character via the dresses lookup table
  const dressParts: string[] = [];

  for (let i = 0; i < realNames.length; i++) {
    const charData = characters.find((c) => c.realName === realNames[i]);
    if (!charData) continue;

    const matched = dressNames.find((dn) => {
      const d = dresses.find((d) => d.name === dn);
      return d && d.characterId === charData.id;
    });

    if (matched && matched !== "Any") {
      dressParts.push(`${displayNames[i]} - ${matched}`);
    }
  }

  if (!dressParts.length) return groupName;
  return `${groupName} (${dressParts.join(", ")})`;
}
