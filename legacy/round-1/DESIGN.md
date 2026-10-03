---
name: Meesho ReLoop Prototype
description: A Meesho-native recovery marketplace for turning stranded seller stock into trusted B2B lots.
colors:
  jamuni-deep: "#3f0b36"
  jamuni-brand: "#9f2089"
  jamuni-active: "#f7eaf5"
  aam-highlight: "#f4bd32"
  ink-primary: "#201c1f"
  ink-secondary: "#4e464c"
  ink-muted: "#756b72"
  canvas: "#f6f5f7"
  surface: "#ffffff"
  divider: "#e4dfe3"
  success: "#15734d"
  success-soft: "#eaf7f1"
  warning: "#9b5b00"
  warning-soft: "#fff5d9"
  information: "#2164b0"
  information-soft: "#eaf3ff"
typography:
  headline:
    fontFamily: "Mier Book, Inter, Segoe UI, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Mier Book, Inter, Segoe UI, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Mier Book, Inter, Segoe UI, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Mier Book, Inter, Segoe UI, Arial, sans-serif"
    fontSize: "10px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  chip: "5px"
  control: "9px"
  item: "10px"
  panel: "14px"
  pill: "99px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  page: "30px"
components:
  button-primary:
    backgroundColor: "{colors.jamuni-brand}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    height: "42px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.jamuni-deep}"
    rounded: "{rounded.control}"
    height: "34px"
    padding: "0 12px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.panel}"
    padding: "16px"
  status-chip:
    rounded: "{rounded.chip}"
    padding: "5px 7px"
---

# Design System: Meesho ReLoop Prototype

## Overview

**Creative North Star: "The Value-Recovery Control Rail"**

ReLoop is an operational, confidence-led extension of the Meesho Supplier Panel. It pairs familiar marketplace navigation with a persistent recovery journey—identify, grade, pool, sell, pick up and pay out—so every role can see the next money-relevant action without learning a new interface language.

The system is dense but calm: white work surfaces, crisp dividers, short labels, structured tables and restrained Meesho colour. Brand expression comes through Jamuni actions, Aam value highlights and recognisable line icons; trust is communicated through explicit grades, fee breakdowns, manifests, statuses and exception paths rather than decorative claims.

**Key Characteristics:**

- Operational density with one clear action per task state.
- Persistent recovery progress and explicit value visibility.
- Role-aware seller, recovery-buyer and internal-operations shells.
- Evidence-first marketplace patterns for grading, auctions, fulfilment and claims.
- Synthetic prototype figures are visibly labelled as illustrative.

## Colors

Deep Jamuni anchors navigation and commitment actions; Aam highlights recovered value; semantic green, amber and blue distinguish success, caution and information without relying on colour alone.

**The Commitment Colour Rule.** Jamuni is reserved for brand anchors, active navigation and actions that advance the transaction; it must not flood operational content.

**The Semantic Pair Rule.** Every semantic foreground colour has a pale companion surface and is reinforced by an icon or text label.

## Typography

**Display and Body Font:** Mier Book, with Inter, Segoe UI, Arial and sans-serif fallbacks.

**Character:** Friendly and practical rather than editorial. Large type is reserved for page headings and monetary figures; most operational information uses compact titles, body copy and uppercase micro-labels.

### Hierarchy

- **Headline** (700, 28px, 1.15): page purpose and task state.
- **Title** (700, 14–16px): panel headings, lot titles and decision summaries.
- **Body** (400, 11–14px, about 1.45): instructions, descriptions and transaction details.
- **Label** (800, 8–11px, 0.06–0.08em): table headers, eyebrows, IDs and compact metadata.
- **Money / KPI** (700–800, 18–31px): amounts, recovery potential, bid values and operating metrics.

**The Numbers Need Context Rule.** A large value is always paired with a plain-language label, unit and—when relevant—an explanation of fees, range or trend.

## Layout

The desktop shell uses a fixed 248px sidebar, a sticky 68px top bar and a centred content region capped at 1580px with 30px horizontal padding. Pages begin with a heading/action row, then organise work through bordered panels, compact workflow rails, tables and two- or three-column grids. Repeated 8, 12, 16, 24 and 30px intervals create a tight operational rhythm.

Navigation and content are role-aware: Seller surfaces prioritise recovery tasks and payout; Buyer surfaces prioritise lot discovery, passports, bids and orders; Internal surfaces prioritise marketplace health and exceptions. Switching roles resets to the role's natural entry screen.

At narrower widths, dense grids collapse from three columns to two and then one, secondary asides move below primary content, and the marketplace filter panel is hidden below 900px. On phones and tablets, the sidebar becomes an accessible slide-in drawer, the perspective switch remains visible, page actions stack, and wide operational tables become horizontally scrollable. The three role journeys therefore remain usable from a compact phone screen through a large desktop.

## Elevation & Depth

The interface is flat by default. Hierarchy comes primarily from white surfaces on a soft grey canvas, 1px dividers and tonal semantic backgrounds. Low Jamuni-tinted shadows appear only on the recovery rail, primary action, interactive lot hover and transient toast.

**The Flat-by-Default Rule.** Static panels use borders, not shadows; elevation signals a focal journey, interaction or temporary system feedback.

## Shapes

The form language is gently rounded and utilitarian. Major panels use 14px corners, controls use 8–10px corners, compact chips use 4–6px corners, and progress/status markers use full pills or circles. Thin neutral borders separate dense information while coloured left edges, dots and fills mark active or current states.

## Components

### Buttons

- **Primary:** solid Jamuni, white type, 42px height and 9px radius; used for the single action that advances the current flow.
- **Secondary / row action:** white surface, neutral border and deep Jamuni text; used for review, preview, filtering and reversible actions.
- **Icon button:** 38px square with border and 9px radius; badges appear only for genuine priority signals.
- **Focus:** a visible three-pixel translucent Jamuni outline with two-pixel offset. Hover deepens the primary colour or adds a subtle neutral fill.

### Chips

Status chips combine a short label with semantic foreground and pale background. Grade, match, risk and lifecycle chips stay compact and do not replace explanatory copy when the consequence is material.

### Cards / Containers

Panels use a white surface, neutral 1px border and 14px radius. Internal headers are about 50–54px high with a bottom divider. Dense content is separated by rules before additional card nesting is introduced.

### Inputs / Fields

Fields use white or near-white surfaces, neutral strokes and 7–9px corners. Capture, condition and pricing flows pair controls with examples, confidence notes or value previews before commitment. Selection is expressed through both border/fill and an explicit radio, check or label.

### Navigation

The sidebar groups work by role and keeps a persistent account identity at the bottom. “Recovery home” and “Buyer home” are parent hubs, with their respective task journeys visibly nested below them; Meesho Source remains a separate second-pillar destination. Active items use a pale Jamuni fill, bold label and a three-pixel Jamuni indicator. The top bar carries search, prototype disclosure, help, priority notification and the perspective switch.

### Recovery Rail

The signature rail turns the recovery lifecycle into a persistent value story. Its deep Jamuni value block leads into numbered or completed stages; compact variants reuse the same language inside task screens.

### Marketplace Trust Patterns

Buyer decisions are supported by a lot passport, condition mix, seller count, provisional/hub evidence, landed-cost preview and bounded protection rules. Pre-order identities remain masked; checkout exposes the Trust Premium and logistics separately. Internal exceptions preserve an audit trail and route uncertain or high-value cases to human review.

## Do's and Don'ts

### Do:

- **Do** show the next money-relevant action before secondary analytics.
- **Do** explain grade, quantity, price, Trust Premium, logistics and payout timing before commitment.
- **Do** use familiar tables, rails, chips and explicit statuses for operational scanning.
- **Do** preserve distinct information priorities for seller, buyer and internal roles.
- **Do** pair colour with text, icons and visible focus states.

### Don't:

- **Don't** present ReLoop as RTO insurance or charge sellers for Meesho's compensation obligations.
- **Don't** hide buyer fees inside the seller's cleared bid value or Meesho B2C proceeds.
- **Don't** move seller inventory before demand is confirmed in the designed flow.
- **Don't** expose counterparty identities before protected order formation.
- **Don't** use unlabelled prototype data as if it were live Meesho performance.
- **Don't** add ornamental gradients, oversized marketing copy or floating cards that weaken operational scanability.
