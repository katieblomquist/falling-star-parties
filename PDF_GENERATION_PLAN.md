# PDF Generation Plan: Auto-Generate Finalization PDFs from Notion

## Overview

A new API route that can be triggered from a Notion automation button (or Slack workflow) to automatically generate a finalization PDF for a booked event and return it as a direct download.

---

## Workflow

```
Notion row (button clicked)
        │
        ▼
GET /api/generatePdf?pageId=<notionPageId>&secret=<PDF_SECRET>
        │
        ├── Validate secret token
        ├── Fetch Notion page properties
        ├── Map real character names → generic display names
        ├── Map package → activities list + duration + pricing
        ├── Select character PDF image
        ├── Calculate total (base + add-ons + travel fee)
        ├── Generate PDF via @react-pdf/renderer
        ├── Append "PDF generated — [timestamp]" block to Notion page
        └── Return application/pdf download
```

---

## Phase 1: Setup

### 1.1 New Branch
```
feature/pdf-generation
```

### 1.2 New Dependency
```
@react-pdf/renderer
```

### 1.3 New Environment Variable
```
PDF_SECRET=<your-secret-token>
```
Add to `.env.local` and AWS Amplify environment config.

### 1.4 Notion Database Change
Add a new **`Travel Fee`** property to the Notion database:
- **Type:** Number
- **Format:** Dollar
- Fill this in on the Notion row before generating the PDF.
- If blank or 0, it is omitted from the pricing section.

---

## Phase 2: New API Route

**File:** `src/app/api/generatePdf/route.ts`

### Behavior

1. Read `pageId` and `secret` from query params
2. Validate `secret` against `PDF_SECRET` env var — returns 401 if invalid
3. Fetch the Notion page using `NOTION_KEY`
4. Extract and map properties:
   - Real character names (e.g. "Elsa") → generic display names (e.g. "Ice Queen") via reverse `characterNameMap`
   - Package name (e.g. "Sparkle - 60 Min") → activities list + duration + base price
   - Extras names → costs from `content.ts`
   - `Travel Fee` number property → included in pricing if > 0
5. Select character PDF image based on character combination (see mapping below)
6. Build and stream PDF using `@react-pdf/renderer`
7. Append a rich text block to the Notion page: `"Finalization PDF generated — [timestamp]"`
8. Return `Content-Type: application/pdf` as a direct download

---

## Phase 3: PDF Layout

Single page, portrait orientation.

```
┌──────────────────────────────────────────────────┐
│  [logo]                       [character image]  │
│                               (443) 327-9751     │
│                               fallingstarparties │
│                               info@falling...    │
├──────────────────────────────────────────────────┤
│  Thank you for choosing Falling Star Parties!    │
│  We are so excited to have [character(s)] attend │
│  [child's name]'s special day!...                │
├──────────────────────────────────────────────────┤
│  Event Information                               │
│  Date / Time / Location / Child's Name & Age     │
│  Characters: [generic display names]             │
│  [Dress note if applicable]                      │
├──────────────────────────────────────────────────┤
│  Event Outline                                   │
│  • [activities — dynamic per package]            │
│  Your [duration] Visit will Include:             │
├──────────────────────────────────────────────────┤
│  The Day of Your Visit                           │
│  [static boilerplate — attendant, weather policy]│
├──────────────────────────────────────────────────┤
│  Pricing                                         │
│  Base Visit Price:            $XXX               │
│  [Second Character Add-On:    $XXX] (if 2+ chars)│
│  [Each Extra name:            $XXX]              │
│  [Travel Fee:                 $XXX] (if > 0)     │
│  ──────────────────────────────────              │
│  Total:                       $XXX               │
│  [Retainer boilerplate text]                     │
└──────────────────────────────────────────────────┘
```

---

## Reference Data

### Character → PDF Image Mapping

| Characters in Notion | Image file (`public/pdfImages/`) |
|---|---|
| Elsa only | `elsa-pdf.png` |
| Anna only | `anna-pdf.png` |
| Elsa + Anna | `elsa-anna-pdf.png` |
| Ariel | `ariel-pdf.png` |
| Belle | `belle-pdf.png` |
| Cinderella | `cinerella-pdf.png` |
| Aurora | `aurora-pdf.png` |
| Rapunzel | `rapunzel-pdf.png` |
| Glinda / any other combo | `multi-character-pdf.png` |

> Note: `cinerella-pdf.png` has a typo in the filename — keep as-is to match the existing file.

---

### Character Name Mapping (Notion → PDF)

Notion stores **real names**; the PDF displays **generic names**:

| Stored in Notion | Displayed in PDF |
|---|---|
| Elsa | Ice Queen |
| Anna | Snow Princess |
| Ariel | Mermaid Princess |
| Belle | Rose Princess |
| Cinderella | Glass Slipper Princess |
| Aurora | Sleeping Princess |
| Rapunzel | Tower Princess |
| Glinda | Bubble Queen |

---

### Package → Activities + Pricing

#### Birthday Parties

| Package | Duration | Activities | Base Price | Add'l Character |
|---|---|---|---|---|
| Dream | 30 min | Story Time, Princess Lessons + Coronation, Photo Opportunity, Happy Birthday Song | $200 | $100 |
| Sparkle | 60 min | + Party Games (Simon Says, Hide and Go Seek, Duck Duck Goose) | $275 | $150 |
| Shine | 90 min | + Face Painting with `[character name(s)]`, Bubble Play | $350 | $200 |

#### Public / Charity Events

| Package | Duration | Activities | Base Price | Add'l Character |
|---|---|---|---|---|
| One Hour Meet and Greet | 60 min | Magical Encounters, Smiles and Warm Hugs, Photo Opportunity | $250 / $175 | $150 / $75 |
| Two Hour Meet and Greet | 120 min | Magical Encounters, Smiles and Warm Hugs, Photo Opportunity | $400 / $250 | $300 / $150 |

> Public / Charity have different pricing — use `Event Type` from Notion to pick the right base price.

---

### Add-On Pricing

| Extra Title | Cost |
|---|---|
| Storybook Keepsake | $20 |
| Deluxe Storybook Keepsake | $35 |
| Deluxe Princess Set | $30 |
| Gift Bags | $10 per child |
| Interactive Storytime (Public) | $75 |
| Interactive Storytime (Charity) | $50 |
| Character Cards | $1 per child |
| Storytime (add-on) | Free |

> For per-child extras (Gift Bags, Character Cards), multiply by `Number of Children` from the Notion row.

---

## Notion Automation Button URL Format

```
https://your-domain.com/api/generatePdf?pageId={{page_id}}&secret=<PDF_SECRET>
```

This same URL works for the **Slack integration** — a Slack workflow step can `GET` it when a performer is confirmed. The response is a PDF file that can be sent as a Slack file attachment or emailed to the client.

---

## Files to Create / Modify

| File | Action |
|---|---|
| `src/app/api/generatePdf/route.ts` | Create — main route handler |
| `src/app/api/generatePdf/pdfTemplate.tsx` | Create — `@react-pdf/renderer` layout component |
| `src/app/api/generatePdf/pdfData.ts` | Create — data mapping helpers (characters, packages, pricing) |
| `.env.local` | Add `PDF_SECRET` |
| `package.json` | Add `@react-pdf/renderer` |

---

## Open Questions / Future Enhancements

- [ ] Should the PDF also be emailed to the client automatically on generation?
- [ ] Should a copy be uploaded to S3 / stored with a persistent URL?
- [ ] Add a `Confirmed Performer` property to Notion to trigger Slack automation
- [ ] Pricing note: costs are looked up from `content.ts` at generation time — if prices change after booking, the PDF will reflect new rates. Consider adding a locked `Total` field to Notion if this becomes an issue.
