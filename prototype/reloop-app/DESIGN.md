---
name: ReLoop + Source Application
description: An account-based recovery and sourcing workspace with explicit evidence, price and fulfilment decisions.
colors:
  jamuni-brand: "#9f2089"
  jamuni-deep: "#481441"
  jamuni-soft: "#f7edf5"
  jamuni-hover: "#821971"
  ink-primary: "#251d26"
  ink-muted: "#655c66"
  canvas: "#f7f6f8"
  surface: "#fff"
  divider: "#e6e0e7"
  control-border: "#d8d1d9"
  secondary-border: "#d9cfd9"
  focus: "#c689b8"
  status-neutral: "#655368"
  status-neutral-soft: "#eeeaf0"
  status-positive: "#175b3e"
  status-positive-soft: "#e8f3ed"
  status-pending: "#805200"
  status-pending-soft: "#fff1d8"
  status-transit: "#305990"
  status-transit-soft: "#eaf0ff"
  status-cancelled: "#9b3b3b"
  status-cancelled-soft: "#f8e9e9"
  success: "#176646"
  success-soft: "#edf7f0"
  error: "#922d25"
  error-soft: "#fff0ee"
  notice: "#534555"
  notice-soft: "#f4f0f6"
  warning: "#795217"
  warning-soft: "#fff4dc"
  ops-urgent: "#a92b39"
  ops-urgent-soft: "#fff6f5"
  ops-attention: "#99610c"
  ops-handoff: "#765083"
  chart-track: "#f2edf3"
  chart-settlement: "#ad6ca1"
  bid-guide-soft: "#f5edf4"
  demo-selected: "#fcf7fb"
  demo-notice: "#67435f"
  demo-notice-soft: "#f3eaf2"
typography:
  display:
    fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    fontSize: "58px"
    fontWeight: 720
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    fontSize: "29px"
    fontWeight: 720
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    fontSize: "19px"
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 1.65
  label:
    fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
  button:
    fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 650
    lineHeight: 1.3
  badge:
    fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 650
    lineHeight: 1.25
  amount:
    fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    fontSize: "34px"
    letterSpacing: "-0.035em"
  ops-metric:
    fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 720
    letterSpacing: "-0.035em"
  demo-headline:
    fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 720
    lineHeight: 1.12
    letterSpacing: "-0.035em"
rounded:
  badge: "5px"
  icon: "6px"
  field: "7px"
  button: "8px"
  summary: "9px"
  panel: "10px"
  ops-panel: "12px"
  demo-dialog: "16px"
spacing:
  compact: "8px"
  control: "12px"
  content: "16px"
  field: "18px"
  group: "20px"
  row: "22px"
  panel: "24px"
  section: "28px"
  heading: "30px"
  columns: "32px"
  page: "38px"
components:
  button-primary:
    backgroundColor: "{colors.jamuni-brand}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "11px 17px"
  button-primary-hover:
    backgroundColor: "{colors.jamuni-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.jamuni-deep}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "11px 17px"
  button-secondary-hover:
    backgroundColor: "{colors.jamuni-soft}"
  button-quiet:
    textColor: "{colors.jamuni-brand}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "11px 17px"
  input:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.field}"
    padding: "11px 12px"
  navigation-active:
    backgroundColor: "{colors.jamuni-soft}"
    textColor: "{colors.jamuni-brand}"
    rounded: "{rounded.field}"
    padding: "12px"
  status-chip:
    backgroundColor: "{colors.status-neutral-soft}"
    textColor: "{colors.status-neutral}"
    typography: "{typography.badge}"
    rounded: "{rounded.badge}"
    padding: "5px 8px"
  buy-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.panel}"
    padding: "24px"
  evidence-capture:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "14px"
  record-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    padding: "22px"
  demo-dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.demo-dialog}"
    padding: "36px 40px 24px"
    width: "min(900px, calc(100vw - 32px))"
  demo-role-selected:
    backgroundColor: "{colors.demo-selected}"
  demo-workspace-note:
    backgroundColor: "{colors.demo-notice-soft}"
    textColor: "{colors.demo-notice}"
    rounded: "{rounded.field}"
    padding: "11px 15px"
  ops-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.ops-panel}"
  ops-metric:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    padding: "21px 22px"
  ops-metric-urgent:
    backgroundColor: "{colors.ops-urgent-soft}"
  queue-filter-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.jamuni-brand}"
    rounded: "{rounded.badge}"
    padding: "7px 12px"
  voice-panel:
    padding: "17px 0 0"
  bid-budget-result:
    backgroundColor: "{colors.bid-guide-soft}"
    rounded: "{rounded.summary}"
    padding: "18px"
---

# Design System: ReLoop + Source Application

## Overview

**Creative North Star: "The Value-Recovery Control Rail"**

ReLoop + Source extends the established Meesho ReLoop identity into a persistent, account-based operational application. Its creative north star remains "The Value-Recovery Control Rail": each screen makes the next stock, price or fulfilment decision legible through evidence, explicit status and a clear action.

The working surface is calm and practical: white content areas on a pale canvas, Jamuni actions, thin dividers, native forms and restrained line icons. Density follows the task; photographs, quantities, prices and decision history receive space before secondary explanation. Saved accounts use persistent account and stock records; isolated demo workspaces use clearly labelled illustrative records. Payment and logistics events remain explicitly in test mode.

This is a separate application surface, not a replacement for the earlier prototype design. Preserve the incumbent brand commitment while following the tokens extracted from src/style.css and the approved extensions in src/features.css, DemoEntry, OpsDashboard, VoiceSearch and BidAssistant. The parent PRODUCT.md supplies durable brand, accessibility and trust principles; its earlier prototype framing does not define this app’s navigation. The demo entry frames this work as a proposed Meesho extension, with seller and operations views inside the proposed existing-software journey and buyer and supplier views joining the network.

**Key Characteristics:**

- Account-based seller, buyer, supplier and private operations workspaces.
- Plain, action-led headings with visible evidence and financial context.
- Flat white surfaces, modest corner rounding and restrained Jamuni accents.
- Native controls, visible keyboard focus and text-labelled status.
- Fixed desktop sidebar; mobile drawer and role-appropriate bottom navigation.
- An isolated four-role demo chooser, with real account roles controlled by the server.
- Priority-led operations, editable voice search and transparent buyer budget guidance.

Documentation basis: source extraction on 27 September 2026, preserving the incumbent system and merging only the approved extension. The primary implementation agent checked 1280px and 1440px desktop views, a true 390px iframe and 375px content, city drilldown, bid submission and on-device Whisper with an English recording. Browser screenshots were available inline only; no supported local export was available for an independent visual approval. The independent reviewer returned **ship** within functional/source scope and scored all three reported findings resolved. Backend tests (9) and frontend tests (6) passed as reported by the implementation agent. This documentation pass checked source and documentation consistency; it did not repeat those tests or conduct a visual review. The detector engine was unavailable. Physical microphone use and Hindi/Hinglish accent accuracy remain unvalidated. The surface brief holds feature-specific strategy and the detailed verification limits.

## Colors

The palette carries the Meesho Jamuni identity into quiet work surfaces. The frontmatter is the normative colour reference; values originate in the current stylesheet rather than the earlier prototype.

### Primary

- **Jamuni Brand:** primary actions, links, active navigation, checkbox accents and key action icons.
- **Jamuni Deep:** the wordmark, secondary button text and compact commitment headings.
- **Jamuni Soft:** active navigation and hover surfaces for secondary, quiet and icon controls.
- **Jamuni Hover:** the darker primary-button hover state.

### Neutral

- **Ink Primary / Ink Muted:** primary content and supporting text respectively.
- **Canvas / Surface:** pale page canvas and white operational surfaces.
- **Divider / Control Border / Secondary Border:** separate content, native fields and secondary actions without elevation.
- **Focus:** the shared visible keyboard-focus outline.

### Semantic feedback

- **Status Neutral:** draft, awarded and other states without an explicit semantic override.
- **Status Positive:** open, published, settled and delivered.
- **Status Pending:** review, awaiting payment, forming and pickup.
- **Status Transit:** shipped and ready to dispatch.
- **Status Cancelled:** cancelled and withdrawn.
- **Success / Error:** inline confirmation and recoverable form or command failure.
- **Notice / Warning:** task guidance and conditions needing attention.
- **Ops Urgent / Ops Attention / Ops Handoff:** shared queue dots and map bubbles for an exception, an available operations action and a wait for another handoff. The urgent KPI also uses its pale surface; these are priorities, not replacements for lifecycle badges.
- **Chart Track / Chart Settlement:** quiet stage-bar tracks and muted Jamuni daily settlement bars. Stage bars use Jamuni Brand.
- **Bid Guide Soft:** the buyer's calculated bid limit and stress scenario.
- **Demo Selected / Demo Notice:** selected or hovered persona rows and the persistent illustrative-workspace notice.

Semantic feedback uses the paired foreground and pale surface tokens listed in the frontmatter. Success messages and positive status badges intentionally use distinct incumbent pairs. The sidecar’s eight-step OKLCH ramps are generated colour-preview metadata, not additional colours used by the application.

**The Commitment Colour Rule.** Use Jamuni for brand anchors, active navigation and actions that advance the task. Keep operational content on quiet, mostly white surfaces.

**The Status in Words Rule.** Pair every status colour with its explicit state label. A coloured chip alone never communicates a transaction consequence.

## Typography

**Display and Body Font:** Inter, with Segoe UI, Arial and sans-serif fallbacks. The stylesheet requests this stack; a locally available fallback may render when Inter is unavailable. Do not assert that Mier is loaded in this application.

**Character:** practical, familiar and readable. Headings carry the next task; figures align clearly; supporting text stays subordinate without relying on unusually faint colour.

### Hierarchy

- **Display:** the large authentication story headline only; it reduces at the medium breakpoint and its story block is hidden on mobile.
- **Headline:** page purpose; reduces to 25px at the mobile-shell breakpoint and 24px on compact phones. The authentication form heading retains its separate 28px mobile override.
- **Title:** section headings. Stock-row titles use 16px; lot cards use 17px, rising to 19px on compact phones.
- **Body:** paragraphs use a generous line-height and a default maximum measure of 72ch. Supporting text commonly uses 12px.
- **Label:** sentence-case native field labels; buttons and chips have distinct heavier roles in the frontmatter.
- **Amount:** prominent per-unit figures. Summary values use 23px on desktop and 20–21px on smaller screens. Monetary totals and amounts use tabular numerals.
- **Operations metric:** prominent priority-strip values with tabular numerals; reduces to 27px at the mobile-shell breakpoint and 25px at 540px. Operations page headings use 28px, rise to 31px from 1400px and reduce to 25px at 800px.
- **Demo headline:** the entry dialog's proposal framing; reduces to 29px at 800px and 26px at 540px. Persona titles use 16px and supporting copy uses 12px.

**The Numbers Need Context Rule.** Pair monetary figures with the relevant unit, quantity and fee context. Keep product value, service premium, delivery assumption and total test amount distinct.

## Layout

The desktop app uses a fixed left sidebar (238px), a normal-flow top bar (68px), and a centred main region capped at 1420px. The workspace offsets by the sidebar width. Main padding is 34px vertically at the top, 38px horizontally and 60px at the bottom. Page headings pair the task title with a relevant action, followed by flat records, evidence or form content.

Detail pages use a flexible main column and a 330px transaction aside with a 32px gap. The aside is sticky at 24px from the viewport top. Stock creation uses a flexible form column and a 260px guidance column with a 50px gap. The marketplace starts with a three-column card grid, and evidence uses three columns. General paired fields remain two columns even on phones; long form instructions run across the form.

Responsive changes follow the actual stylesheet:

| Condition | Implemented change |
| --- | --- |
| At least 1500px | Main top padding rises to 42px; marketplace images become 240px high. |
| At most 1150px | Sidebar narrows to 210px; main/top-bar horizontal padding becomes 25px; transaction aside becomes 290px; marketplace becomes two columns; stock guidance moves below the form; search controls wrap. |
| At most 800px | Sidebar becomes a 250px sliding drawer; top bar becomes 60px; content loses its sidebar offset; detail columns stack with the transaction aside below evidence; bottom navigation appears; main bottom padding becomes 110px. Authentication becomes one column and hides the long story. |
| At most 480px | Main horizontal padding becomes 16px; page-heading actions fill the row; marketplace becomes one column; filters remain available in two columns; quotes stack; stock-row actions wrap. Three-photo capture remains a compact three-column row. |

The drawer has a scrim, Escape dismissal, a keyboard focus loop and focus restoration. Navigation closes the drawer. Bottom navigation includes the first four destinations available to the signed-in account and respects the device safe-area inset. The complete navigation remains in the drawer. Real account roles come from the server. The approved demo workspace adds a separate chooser for switching among isolated seller, buyer, supplier and operations views; it is not an account-permission control.

The operations priority strip has four columns, reducing to two at 1200px. The map and stage panels use a 1.1:1 grid with a 26px gap, stacking at 1200px. Panel headers and queue rows align task, age and amount; row amounts hide at 800px while the record remains actionable. Detailed definitions use a three-column grid that stacks at 800px. Exact chart tables remain accessible in disclosures.

The demo dialog is viewport-constrained and scrollable, with a maximum height of `calc(100dvh - 32px)`. Its two-column persona grid becomes one column at 540px; padding reduces to 28px 23px 20px at 800px. Voice language and engine fields use two columns, a 16px gap and a 650px maximum width, stacking at 800px. The bid guide remains a single column within the existing transaction panel.

## Elevation & Depth

Ordinary application surfaces remain flat: white surfaces, neutral rules and pale contextual fills provide the depth vocabulary. The approved feature stylesheet adds two bounded exceptions: the native demo dialog uses `0 22px 75px #24102f38` over a `#24102f88` backdrop, and the selected queue filter uses `0 2px 4px #33153810`. The dialog lives in the browser's top layer. The mobile scrim separates navigation from the working page; stacking order is bottom navigation (20), scrim (25), sidebar (30), then the focused skip link (100).

A marketplace card lifts by 2px and changes border colour on hover without a shadow. Primary, secondary and quiet actions transition colour and background over 160ms; marketplace movement uses 160ms and the drawer uses 180ms. Reduced-motion preferences remove transitions.

**The Flat by Default Rule.** Use borders and tonal surfaces to establish hierarchy. Reserve the documented shadow exceptions for the demo dialog and selected queue filter; ordinary panels and controls stay flat.

## Shapes

Corners are modest and utilitarian: compact status chips, slightly rounder native fields and buttons, then broader bordered panels. Use the extracted radius roles in the frontmatter. Existing panels retain their incumbent rounding; the approved operations panels and demo dialog have their own larger roles and do not redefine the base panel. Photographs crop to their evidence or card slots with object-fit cover; evidence links preserve access to the full photo.

Thin solid borders structure cards, lists and fields. Dashed borders distinguish empty states and photo-capture targets. Activity dots are circular. The app avoids device frames, decorative floating layers and ornamental gradients.

## Components

### Buttons

Primary, secondary and quiet variants share a minimum height of 44px, 9px internal icon gap and the button typography role. Primary actions use Brand with white text; secondary actions use Surface, Deep text and a neutral stroke; quiet actions use transparent fill with Brand text. Secondary and quiet hover states use Soft.

Keyboard focus uses a 3px Focus outline with a 3px offset. Disabled buttons reduce opacity to 0.55 and use a waiting cursor. Submit forms disable the fieldset while saving, change the action label to "Saving…" and expose failure text in an alert region. Icon buttons use a separate 40px minimum square and descriptive accessible names.

### Chips

Status badges remain compact and text-labelled. Their explicit class-to-status mappings are recorded under Colors; any state without a semantic override uses the neutral pair. They are informational labels, not interactive filters.

### Cards / Containers

Record lists, search surfaces, narrow forms and transaction panels share a white surface, thin divider border and panel rounding. Internal record rows divide with rules instead of nested cards. Empty states use a dashed border, an inbox icon, a concise explanation and an optional next action.

Marketplace cards use actual uploaded stock photos, a status badge over the photo, city/category metadata, declared condition, a per-unit minimum and lot quantity. Hover changes the border and translates upward slightly; the full card is a keyboard-focusable button.

### Inputs / Fields

Use native input, select, textarea, date, number and checkbox controls with visible labels. Standard controls have a 44px minimum height, field rounding, white background, neutral border and 11px by 12px padding. Textareas are vertically resizable with a 95px minimum height. Checkboxes retain their native behaviour with a Jamuni accent.

Place requirement, validation and consequence text near the field or submit action. Form errors use an explicit alert region. Preserve browser validation attributes and the shared visible focus outline. The captured photo upload target uses a native file input over the visible label and a focus-within outline.

### Navigation

The sidebar shows the ReLoop + Source wordmark, business identity, account role and permitted destinations. Navigation rows are at least 44px high; active rows use Soft, Brand and a heavier label. Hover uses a faint neutral fill. The top bar carries the current section, language control, refresh and sign-out.

Seller, buyer, supplier and private operations accounts receive different destinations and starting screens. Public account creation offers seller, buyer and supplier only. The mobile drawer adds focus management, and the bottom bar repeats the first four permitted destinations. Keep the skip-to-content link and accessible names on icon-only actions. Some content supports English and Hindi; do not imply every screen is fully translated.

Demo workspaces add a labelled demo-view control and an illustrative-data notice. The persona chooser switches only within that visitor's isolated demo room and preserves its journey. The operations demo is explicitly separate from private operations account access; never place private operator credentials in the chooser, documentation or public UI.

### Evidence capture and contributions

Stock creation requests three labelled views: front, defect/detail and all units together. The photo slot shows the uploaded preview, a replacement affordance and any quality warning. Local quality checks provide guidance and explicitly do not certify authenticity or damage.

A pooled lot retains each seller contribution’s quantity, minimum, declared details and complete linked evidence. A top photo grid supports scanning, while contribution blocks preserve traceability. Condition remains seller-declared until a recorded inspection.

### Transaction panel and activity

The transaction aside keeps unit price, quantity and next action together. Cost breakdowns use labelled product value, service premium, delivery assumption and total test amount, with tabular figures and a separated total row. Supporting notices explain what must happen before the next step.

Order status surfaces and chronological activity rows communicate recorded decisions with words and restrained icons. Quantity changes expose acceptance actions, cancellation leaves a visible recovery path, and open issues explain why settlement is held. Preserve the test-mode wording beside financial and logistics actions.

### Demo entry

A native modal dialog introduces the proposed Meesho extension and presents four equally available persona rows with role, setting, job and next action. Selected and hovered rows use Demo Selected. Starting or switching disables the chooser controls and shows "Opening…" on the requested view; errors appear in an alert. Escape dismisses when idle, and focus returns to the prior control on close. Saved-account sign-in stays available. The explainer states that data and images are illustrative, payments and delivery are test events, and demo changes are isolated and retained for up to 24 hours.

### Priority operations and charts

The priority strip distinguishes actionable exception and ready-work buttons from informational backlog and settlement values. Buttons focus the corresponding queue filter. Queue rows present the required decision first, then stock and city, time since update and product value; an explicit empty state confirms when the selection has no work. Filters use native selects and a segmented control with pressed state.

The India map pairs labelled, keyboard-operable city bubbles with a worded legend and exact city totals, including unmapped locations. Bubble size encodes order count; priority colour and accessible names encode state. Hover, focus and selection strengthen the bubble stroke. The national view remains available when a city filters the operational work. Preserve the Survey of India outline attribution and educational-demo notice.

Stage bars show current counts rather than conversion. Daily settlement bars have a zero baseline, a selected date window and an exact-value table. Keep a metric's definition, denominator, unit and time scope available near the value or in the definitions disclosure. Detailed KPI definitions live in docs/OPERATIONS-VOICE-BIDDING.md; no chart implies forecast, contribution margin or live Meesho performance.

### Editable voice search

Voice search expands inside the existing search surface. Native language and engine selects precede the microphone action, an audio-clip alternative and the engine's privacy explanation. Listening, preparation, model loading, transcription, cancellation and errors have explicit text; the active action offers "Stop & use words". Busy work can be cancelled and closing or leaving stops capture and ignores stale results.

Recognised text fills the editable search field. The user reviews it before choosing "Match by meaning"; voice never submits a bid or order. English, Hindi and Hinglish are offered with honest mixed-language accuracy limits. Browser speech may use its provider's remote service. The Whisper fallback downloads a model and transcribes on the device; its audio is not uploaded to this app. Typed search remains available, and unsupported or quiet audio exposes a recovery path.

### Margin-aware bid guide

A native disclosure in the transaction panel reveals labelled resale, cost, saleable-share and margin inputs. The pale result block shows the maximum affordable per-unit bid, a ten-percentage-point saleability stress case and a clear skip-lot message when the next valid bid exceeds the limit. The calculation includes the proposed premium and per-purchased-unit delivery assumption. "Use this limit" only fills the bid field; review, condition acknowledgement and submission remain separate.

Historical evidence is visually separate from the buyer's own budget. Show a middle-50% range, median, count and matching criteria only when the minimum comparable-settlement count is met; otherwise show the explicit sparse-data state. Label demo evidence as illustrative and historical ranges as descriptive, not valuation, guarantee or trained price prediction.

## Do's and Don'ts

### Do:

- **Do** preserve the Jamuni identity and plain, action-led language.
- **Do** show the next available action beside the relevant quantity, evidence and financial context.
- **Do** use native labelled controls and retain visible focus, error text and pending feedback.
- **Do** preserve each seller contribution’s declared details and photographs inside a pooled lot.
- **Do** keep active navigation, status and confirmation understandable without colour alone.
- **Do** distinguish saved application records from test payments, courier events and settlement.
- **Do** adapt the working layout to the viewport while keeping forms and evidence accessible.
- **Do** label demo workspaces and keep demo persona switching separate from real account permissions.
- **Do** show operational priorities with words, available actions and accessible chart tables.
- **Do** preserve review and explicit submission after voice recognition or bid-limit assistance.

### Don't:

- **Don't** add a prototype device frame or guided walkthrough. The approved demo chooser is the scoped exception to the earlier no-role-switch rule.
- **Don't** copy the earlier prototype’s Mier stack, Aam highlights or recovery rail composition into this app as if they were implemented tokens.
- **Don't** turn matching similarity or uploaded photographs into claims of certified condition.
- **Don't** hide buyer charges within the seller’s product value.
- **Don't** expose an operations role in public account creation, grant real account roles through the demo chooser or publish private operations credentials.
- **Don't** replace native forms with decorative custom controls or use ornamental gradients and floating shadow cards.
- **Don't** present illustrative transactions as live Meesho data, a historical range as trained price prediction or recorded premiums as profit.
- **Don't** imply validated microphone or Hindi/Hinglish accent accuracy from the English-recording check.
