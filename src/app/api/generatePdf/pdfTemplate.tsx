import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import {
  PdfEventData,
  resolveCharacters,
  resolvePackage,
  buildPricingLines,
  buildCharacterBulletValue,
  formatPdfDate,
  formatPdfTime,
} from "./pdfData";

// ---------------------------------------------------------------------------
// Font registration
// ---------------------------------------------------------------------------

Font.register({
  family: "PetitFormalScript",
  src: "https://fonts.gstatic.com/s/petitformalscript/v19/B50TF6xQr2TXJBnGOFME6u5OR83oRP5qoHk.ttf",
});

// ---------------------------------------------------------------------------
// Brand colours
// ---------------------------------------------------------------------------

const TEXT_DARK = "#2A2A2A";
const TEXT_MID = "#555555";
const LIGHT_GRAY = "#F2F2F2";
const DIVIDER = "#DEDEDE";
const PURPLE = "#343B95";
const PURPLE_LIGHT = "#B0B4DC";
const PURPLE_BG = "#F0F1FA";

// Page horizontal padding — applied manually so the right column can bleed
const H_PAD = 36;
// Right column width
const RIGHT_COL = 195;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    paddingTop: 15,
    paddingBottom: 32,
    // No horizontal padding — managed per-section so right col can reach the edge
    fontSize: 10,
    color: TEXT_DARK,
  },

  // ── Two-column section (logo + intro + event info + activities) ────────────
  twoColRow: {
    flexDirection: "row",
    paddingLeft: H_PAD,
    // No paddingRight — right column extends to page edge
  },
  leftCol: {
    flex: 1,
    paddingRight: 25,
  },
  rightCol: {
    width: RIGHT_COL,
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logo: {
    width: 200,
    height: 100,
    objectFit: "contain",
    alignSelf: "center",
  },

  // ── Intro paragraph ───────────────────────────────────────────────────────
  introText: {
    fontSize: 9.5,
    color: TEXT_DARK,
    lineHeight: 1.55,
    marginBottom: 14,
  },

  // ── Section headings ──────────────────────────────────────────────────────
  scriptHeading: {
    fontFamily: "PetitFormalScript",
    fontSize: 20,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  divider: {
    height: 0.5,
    backgroundColor: DIVIDER,
    marginBottom: 10,
  },
  subHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    color: TEXT_DARK,
    marginBottom: 6,
    marginTop: 10,
  },

  // ── Bullet list ───────────────────────────────────────────────────────────
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bulletDot: {
    fontSize: 9.5,
    color: TEXT_DARK,
    marginRight: 6,
  },
  bulletText: {
    fontSize: 9.5,
    color: TEXT_DARK,
    flex: 1,
    lineHeight: 1.45,
  },
  bulletTextBold: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
    flex: 1,
    lineHeight: 1.45,
  },

  // ── Right column: contact box ─────────────────────────────────────────────
  charImage: {
    width: RIGHT_COL,
    height: RIGHT_COL,
    objectFit: "contain",
  },

  // ── Right column: Contact Us box ──────────────────────────────────────────
  contactBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: PURPLE_LIGHT,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 14,
  },
  contactAccentBar: {
    width: 4,
    backgroundColor: PURPLE,
  },
  contactBoxInner: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: H_PAD,
    backgroundColor: PURPLE_BG,
  },
  contactHeading: {
    fontFamily: "PetitFormalScript",
    fontSize: 15,
    color: PURPLE,
    marginBottom: 10,
  },
  contactLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: TEXT_DARK,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  contactValue: {
    fontSize: 8.5,
    color: TEXT_MID,
    marginBottom: 9,
    lineHeight: 1.4,
  },

  // ── Pricing card ──────────────────────────────────────────────────────────
  pricingCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: PURPLE_LIGHT,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 34,
  },
  pricingAccentBar: {
    width: 4,
    backgroundColor: PURPLE,
  },
  pricingCardInner: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 14,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: PURPLE_BG,
  },
  pricingCardHeading: {
    fontFamily: "PetitFormalScript",
    fontSize: 15,
    color: PURPLE,
    marginBottom: 15,
  },
  pricingDivider: {
    height: 0.5,
    backgroundColor: PURPLE_LIGHT,
    marginBottom: 7,
    marginTop: 7,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  pricingLineLabel: {
    fontSize: 9,
    color: TEXT_MID,
    flex: 1,
  },
  pricingLineAmount: {
    fontSize: 9,
    color: TEXT_MID,
    textAlign: "right",
  },
  pricingTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  pricingTotalLabel: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: PURPLE,
    flex: 1,
  },
  pricingTotalAmount: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: PURPLE,
    textAlign: "right",
  },
});

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

function Bullet({ text, bold = false }: { text: string; bold?: boolean }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={bold ? styles.bulletTextBold : styles.bulletText}>{text}</Text>
    </View>
  );
}

function LabelBullet({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>
        <Text style={styles.bulletTextBold}>{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

function PricingCard({
  lines,
  total,
}: {
  lines: { label: string; amount: number }[];
  total: number;
}) {
  return (
    <View style={styles.pricingCard}>
      <View style={styles.pricingAccentBar} />
      <View style={styles.pricingCardInner}>
        <Text style={styles.pricingCardHeading}>Pricing Summary</Text>
        {lines.map((line, i) => (
          <View key={i} style={styles.pricingRow}>
            <Text style={styles.pricingLineLabel}>{line.label}</Text>
            <Text style={styles.pricingLineAmount}>${line.amount}</Text>
          </View>
        ))}
        <View style={styles.pricingDivider} />
        <View style={styles.pricingTotalRow}>
          <Text style={styles.pricingTotalLabel}>Total</Text>
          <Text style={styles.pricingTotalAmount}>${total}</Text>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Day-of bullet points (boilerplate)
// ---------------------------------------------------------------------------

const DAY_OF_BULLETS = [
  "Our princess will arrive at the agreed upon time and follow the event outline listed above.",
  "If available, we will send a character attendant to help our princess with anything she needs, keep track of time, and facilitate communication.",
  "If there is inclimate weather on the day of your visit and conditions are unsafe for travel (i.e. heavy rains, flash floods, ice, etc.), your character will do a quick video call with your little ones and we'll work on getting your visit rescheduled ASAP or roll your deposit over to another event.",
  "If the ground is muddy on the day of your event or it is lightly raining, the event will need to be moved somewhere with an overhead covering and solid ground.",
  "No changes to your booking will be accepted less than 24 hours before your start time.",
];

// ---------------------------------------------------------------------------
// Main template
// ---------------------------------------------------------------------------

interface PdfTemplateProps {
  data: PdfEventData;
  logoSrc: string;
  charImageSrc: string;
}

export function PdfTemplate({ data, logoSrc, charImageSrc }: PdfTemplateProps) {
  const charInfo = resolveCharacters(data.characterRealNames);
  const pkgInfo = resolvePackage(data.packageId, data.eventType);
  const { lines: pricingLines, total } = buildPricingLines(data);
  const characterBulletValue = buildCharacterBulletValue(
    data.characterRealNames,
    data.dressNames
  );
  const dateStr = formatPdfDate(data.dateTime);
  const timeStr = formatPdfTime(data.dateTime);

  // Short date for the document title (e.g. "July 13, 2025")
  const titleDateStr = new Date(data.dateTime).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const logoUrl = logoSrc;
  const charImageUrl = charImageSrc;

  const isBirthday = data.eventType === "Birthday Party";

  const introText = isBirthday && data.childName
    ? `Thank you so much for choosing Falling Star Parties! We are so excited to be a part of your family's celebration and have our ${charInfo.displayName} attend your child's special day! Below you'll find an outline of your event including a pricing breakdown. If everything looks good, please submit payment for your event retainer via the link included in this email. The remaining balance will be due closer to your event—full details will be sent after your retainer is received.`
    : `Thank you so much for choosing Falling Star Parties! We are so excited to have our ${charInfo.displayName} be a part of your event! Below you'll find an outline of your visit including a pricing breakdown. If everything looks good, please submit payment for your event retainer via the link included in this email. The remaining balance will be due closer to your event—full details will be sent after your retainer is received.`;

  return (
    <Document
      title={`${data.clientLastName} Finalization - ${titleDateStr}`}
      author="Falling Star Parties LLC"
    >
      <Page size="LETTER" style={styles.page}>

        {/* ── Two-column section: logo / intro / event info / activities ─── */}
        <View style={styles.twoColRow}>

          {/* Left column */}
          <View style={styles.leftCol}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.logo} src={logoUrl} />

            <Text style={styles.introText}>{introText}</Text>

            <Text style={styles.scriptHeading}>Event Outline</Text>
            <View style={styles.divider} />

            {/* Event Information */}
            <Text style={styles.subHeading}>Event Information</Text>
            <LabelBullet label="Date" value={dateStr} />
            <LabelBullet label="Time" value={timeStr} />
            <LabelBullet label="Location" value={data.address} />
            {isBirthday && data.childName ? (
              <LabelBullet
                label="Child's Name"
                value={`${data.childName}${data.childAge ? ` (${data.childAge})` : ""}`}
              />
            ) : null}
            <LabelBullet label="Characters" value={characterBulletValue} />

            {/* Visit activities */}
            <Text style={styles.subHeading}>
              Your {pkgInfo.duration} Visit will Include:
            </Text>
            {pkgInfo.activities.map((activity, i) => (
              <Bullet key={i} text={activity} />
            ))}
            {data.extrasTitles.map((extra, i) => (
              <Bullet key={`extra-${i}`} text={extra} />
            ))}

            {/* Day of Your Visit */}
            <Text style={styles.subHeading}>The Day of Your Visit</Text>
            {DAY_OF_BULLETS.map((item, i) => (
              <Bullet key={i} text={item} />
            ))}
          </View>

          {/* Right column — extends to page edge */}
          <View style={styles.rightCol}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.charImage} src={charImageUrl} />
            <PricingCard lines={pricingLines} total={total} />
            <View style={styles.contactBox}>
              <View style={styles.contactAccentBar} />
              <View style={styles.contactBoxInner}>
                <Text style={styles.contactHeading}>Contact Us</Text>

                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>(443) 327-9751</Text>

                <Text style={styles.contactLabel}>Email</Text>
                <Text style={[styles.contactValue, { marginBottom: 0 }]}>info@fallingstarparties.com</Text>
              </View>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
