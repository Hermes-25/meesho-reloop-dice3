# Meesho ReLoop + Source Prototype

Interactive Round 1 product prototype for **Dicey Business, IIT Guwahati**.

ReLoop creates a B2B recovery market for returned, damaged, ageing and excess seller stock. Sellers grade and pool stock virtually, verified recovery buyers bid on condition-known lots, and Valmo moves inventory only after a sale. Meesho Source is the phase-two reverse loop: sellers raise protected fresh-stock requests and compare verified wholesaler quotes without exposing off-platform contact details.

## Prototype views

- **Seller:** identify stock, capture evidence, review grade and value, join pools, schedule pickup, track payout, create Source RFQs and compare quotes.
- **Recovery buyer:** discover verified lots, inspect the lot passport, bid, check out and track aggregation.
- **Meesho internal:** monitor liquidity, conversion, trust signals and exception resolution.

All prototype transactions and operating metrics are synthetic but plausible. They demonstrate the proposed workflow and must not be interpreted as live Meesho data.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and use the perspective selector in the top-right corner. The interface is responsive across desktop, tablet and phone layouts.

## Production build

```bash
npm run build
npm start
```

## Repository scope

The `competition-materials` folder contains selected derived research, the concept note, anonymised interview synthesis and the financial model used to shape the prototype. Confidential case briefs, raw interview audio/transcripts and the final submission deck are intentionally excluded.
