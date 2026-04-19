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
  buildDressNote,
  formatPdfDate,
  formatPdfTime,
} from "./pdfData";

// ---------------------------------------------------------------------------
// Brand colours
// ---------------------------------------------------------------------------

const PURPLE = "#343B95";
const LAVENDER = "#EEF0FB";
const SOFT_PINK = "#FDF0F5";
const LIGHT_GRAY = "#F7F7F7";
const DIVIDER = "#D8DAF0";
const TEXT_DARK = "#2A2A2A";
const TEXT_MID = "#555555";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    paddingTop: 0,
    paddingBottom: 32,
    paddingHorizontal: 0,
    fontSize: 10,
    color: TEXT_DARK,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: PURPLE,
    paddingVertical: 22,
    paddingHorizontal: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 110,
    height: 55,
    objectFit: "contain",
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  headerContactText: {
    color: "#FFFFFF",
    fontSize: 9,
    opacity: 0.9,
  },
  characterImage: {
    width: 90,
    height: 110,
    objectFit: "cover",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginLeft: 16,
  },

  // ── Greeting band ────────────────────────────────────────────────────────
  greetingBand: {
    backgroundColor: SOFT_PINK,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  greetingText: {
    fontSize: 11,
    color: PURPLE,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  greetingBody: {
    fontSize: 9.5,
    color: TEXT_MID,
    lineHeight: 1.5,
  },

  // ── Body wrapper ─────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: 36,
    paddingTop: 18,
  },

  // ── Section card ─────────────────────────────────────────────────────────
  card: {
    backgroundColor: LAVENDER,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: PURPLE,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // ── Info grid (2-col) ────────────────────────────────────────────────────
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  infoItem: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: PURPLE,
  },
  infoItemFull: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: PURPLE,
  },
  infoLabel: {
    fontSize: 8,
    color: PURPLE,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 9.5,
    color: TEXT_DARK,
  },

  // ── Activity list ────────────────────────────────────────────────────────
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bullet: {
    color: PURPLE,
    fontSize: 10,
    marginRight: 6,
    marginTop: 0,
  },
  activityText: {
    fontSize: 9.5,
    color: TEXT_DARK,
    flex: 1,
    lineHeight: 1.4,
  },

  // ── Day-of card (light gray) ──────────────────────────────────────────────
  grayCard: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
  },
  grayCardText: {
    fontSize: 9.5,
    color: TEXT_MID,
    lineHeight: 1.5,
  },

  // ── Pricing table ─────────────────────────────────────────────────────────
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: DIVIDER,
  },
  pricingLabel: {
    fontSize: 9.5,
    color: TEXT_DARK,
  },
  pricingAmount: {
    fontSize: 9.5,
    color: TEXT_DARK,
    fontFamily: "Helvetica-Bold",
  },
  pricingTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 7,
    marginTop: 2,
    borderTopWidth: 1.5,
    borderTopColor: PURPLE,
  },
  pricingTotalLabel: {
    fontSize: 11,
    color: PURPLE,
    fontFamily: "Helvetica-Bold",
  },
  pricingTotalAmount: {
    fontSize: 11,
    color: PURPLE,
    fontFamily: "Helvetica-Bold",
  },
  retainerNote: {
    marginTop: 8,
    fontSize: 8.5,
    color: TEXT_MID,
    lineHeight: 1.5,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginVertical: 10,
  },
});

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoItem({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <View style={full ? styles.infoItemFull : styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main template
// ---------------------------------------------------------------------------

interface PdfTemplateProps {
  data: PdfEventData;
  /** Absolute URL base for resolving public images (e.g. https://yourdomain.com) */
  baseUrl: string;
}

export function PdfTemplate({ data, baseUrl }: PdfTemplateProps) {
  const charInfo = resolveCharacters(data.characterRealNames);
  const pkgInfo = resolvePackage(data.packageId, data.eventType);
  const { lines: pricingLines, total } = buildPricingLines(data);
  const dressNote = buildDressNote(data.dressNames);
  const dateStr = formatPdfDate(data.dateTime);
  const timeStr = formatPdfTime(data.dateTime);

  const logoUrl = `${baseUrl}/logo.png`;
  const charImageUrl = `${baseUrl}/pdfImages/${charInfo.imageFile}`;

  const isBirthday = data.eventType === "Birthday Party";

  return (
    <Document
      title={`Falling Star Parties — ${data.childName || data.clientFirstName} Event Finalization`}
      author="Falling Star Parties LLC"
    >
      <Page size="LETTER" style={styles.page}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Image style={styles.logo} src={logoUrl} />
          <View style={styles.headerRight}>
            <Text style={styles.headerContactText}>(443) 327-9751</Text>
            <Text style={styles.headerContactText}>fallingstarparties.com</Text>
            <Text style={styles.headerContactText}>info@fallingstarparties.com</Text>
          </View>
          <Image style={styles.characterImage} src={charImageUrl} />
        </View>

        {/* ── Greeting ───────────────────────────────────────────────────── */}
        <View style={styles.greetingBand}>
          <Text style={styles.greetingText}>
            Thank you for choosing Falling Star Parties!
          </Text>
          <Text style={styles.greetingBody}>
            {`We are so excited to have ${charInfo.displayName} attend ${
              isBirthday
                ? `${data.childName || data.clientFirstName}'s special day`
                : "your event"
            }! Below you will find all the details for your upcoming visit.`}
          </Text>
        </View>

        <View style={styles.body}>
          {/* ── Event Information ──────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Event Information</Text>
            <View style={styles.infoGrid}>
              <InfoItem label="Date" value={dateStr} />
              <InfoItem label="Time" value={timeStr} />
              <InfoItem label="Location" value={data.address} full />
              {isBirthday && data.childName ? (
                <InfoItem label="Guest of Honor" value={data.childName} />
              ) : null}
              {isBirthday && data.childAge ? (
                <InfoItem label="Age" value={`${data.childAge} years old`} />
              ) : null}
              <InfoItem label="Character(s)" value={charInfo.displayName} />
              {dressNote ? <InfoItem label="Costume" value={dressNote} full /> : null}
            </View>
          </View>

          {/* ── Event Outline ──────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Your {pkgInfo.duration} Visit Will Include
            </Text>
            {pkgInfo.activities.map((activity, i) => (
              <View key={i} style={styles.activityRow}>
                <Text style={styles.bullet}>✦</Text>
                <Text style={styles.activityText}>{activity}</Text>
              </View>
            ))}
          </View>

          {/* ── Day of Your Visit ──────────────────────────────────────── */}
          <View style={styles.grayCard}>
            <Text style={[styles.cardTitle, { color: TEXT_DARK }]}>
              The Day of Your Visit
            </Text>
            <Text style={styles.grayCardText}>
              {`An attendant will accompany your character to help the visit run smoothly and keep the magic alive from start to finish.\n\n`}
              {`Please note that we do not offer the use of glitter products due to the potential for damage to our costumes. Face painting is limited to simple character-themed designs given the time available during your event.\n\n`}
              {`We require an alternate indoor location for temperatures above 90°F or below 50°F, as well as during extreme weather, to ensure the safety of your guests and our performers.`}
            </Text>
          </View>

          {/* ── Pricing ────────────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pricing</Text>
            {pricingLines.map((line, i) => (
              <View key={i} style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>{line.label}</Text>
                <Text style={styles.pricingAmount}>${line.amount}</Text>
              </View>
            ))}
            <View style={styles.pricingTotalRow}>
              <Text style={styles.pricingTotalLabel}>Total</Text>
              <Text style={styles.pricingTotalAmount}>${total}</Text>
            </View>
            <Text style={styles.retainerNote}>
              A non-refundable $50 retainer is required within 48 hours to secure your date.
              The remaining balance is due on the day of your event.
              If plans change and a date or time adjustment is needed, we will do our best to accommodate you.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
