# Project: Singapore Car vs Public Transport Decision Tool

## Background & Motivation

I recently went through the process of evaluating car ownership in Singapore due to a change in working arrangements. I manually researched all cost components and built a spreadsheet to compare car ownership vs public transport — including a time-value-of-money angle that most people miss. The process was tedious, repetitive, and the insights were hard to surface from raw numbers. This project is about turning that research process into a fast, intuitive, and personalized web tool.

---

## Domain Context: Car Financing in Singapore

Understanding these components is essential for the tool to make sense:

**Car cost components (annual, converted to monthly where useful):**
- Annual depreciation — the single largest cost, often $15k–$20k+/yr. Derived from (purchase price − PARF/scrap value) ÷ COE tenure (typically 10 years). Many buyers mentally exclude this. The tool must surface it prominently.
- Annual road tax — varies by engine displacement; publicly listed by LTA.
- Annual insurance — varies by car model, driver age, years of experience, NCD (No-Claims Discount). Rough estimate: $2k–$5k/yr.
- Season parking — two main types: HDB (tiered by zone, ~$100–$165/mo) or commercial/MBC (entitled vs non-entitled, ~$196–$240/mo). User's workplace and residence determine which applies.
- Petrol costs — function of: (monthly mileage ÷ fuel economy) × petrol price (RON95 ~$3.40/L, RON97 ~$3.92/L). Monthly mileage is estimated from commute distance × work days + weekend usage.
- Loan servicing (if applicable) — monthly repayment. Multiple scenarios possible ($800/mo, $1,000/mo, $1,500/mo, etc.).

**Reference numbers from my spreadsheet (Audi A4 2.0L B9.5):**
- Annual depreciation: $18,500 | Road tax: $1,194 | Insurance: ~$3,300
- MBC season parking (entitled): $2,354/yr (~$196/mo)
- HDB season parking (Tier 2): $1,980/yr ($165/mo)
- Fuel economy: 13.2 km/L | Monthly mileage: ~1,345 km → ~101.9L/mo
- Petrol cost (RON95): ~$346/mo
- Total monthly car cost (no loan, by depreciation): ~$2,624/mo

**Public transport alternatives:**
- MRT/bus: ~$4.30/day, ~$90/mo for 21 work days
- Grab (private hire): ~$80/trip, ~$1,680/mo for 21 work days

**The core inequality the tool must express:**
> Car financial cost + Car commute time cost ≤ PT financial cost + PT commute time cost

Time cost is monetised using the user's annual total compensation:
- Cost per minute = (Annual comp ÷ 12 months ÷ 21 work days ÷ 9 hrs ÷ 60 mins)
- At $200k/yr: ~$1.47/min → 60 min saved/day × 21 days = ~$1,852/mo in time value

At $200k annual comp, the financial gap (~$2,533/mo vs MRT) narrows to ~$681/mo after accounting for time value. Higher salary or longer commutes close this gap further — this dynamic is the most important insight to surface.

---

## Problem Statement

**Pain point 1 — Tedious manual research:** All cost components are well-defined but scattered across government sites (LTA, HDB, OneMotoring), insurer portals, and petrol trackers. Evaluating multiple cars or scenarios requires repeating this process from scratch.

**Pain point 2 — Numbers pile up, signal gets buried:** Raw spreadsheet numbers don't convey relative importance. Depreciation dwarfs everything else but looks like just another row. The time-value insight is non-obvious without explicit calculation.

**Pain point 3 — Scenarios aren't explorable:** Changing salary, loan amount, WFH days, or time saved requires manual recalculation. There's no way to intuitively feel how sensitive the outcome is to each variable.

---

## Proposed Solution: Web Tool (Frontend-First)

### Architecture philosophy
- Primarily client-side (React or Next.js). No backend unless needed for agentic data fetching (defer to v2).
- No server-side logic for core computation — all estimates run in the browser.
- All numbers must be overridable by the user ("override mode" on every field).
- Persist scenarios in localStorage.

### UX flow: Wizard → Dashboard (not chat, not form)
A 3-step onboarding wizard to collect context, then immediately render a live dashboard.

**Step 1 — Your car:** Car model/type, loan amount (if any), loan tenure. Optionally: engine displacement for road tax lookup.
**Step 2 — Your life:** Home postal code, work destination, WFH days/week. Use OneMap API or Google Maps API to compute actual commute distance/time.
**Step 3 — Your compensation:** Annual total compensation (single field). This powers the time-value calculation.

After wizard → full dashboard auto-populated. Every number has an edit/override affordance.

---

## Feature Priorities (MVP Scope)

### Must-have (MVP)
1. **Wizard onboarding** — 3 steps, collects car + life + comp context
2. **Auto-computed cost breakdown** — all components with sensible defaults pre-filled
3. **The inequality dashboard** — side-by-side: Car total vs PT total, with and without time value. Show the "net monthly gap" prominently.
4. **Interactive sliders** — at minimum: annual total comp, time saved per day (driving vs MRT), WFH days/month. As sliders change, the inequality and gap update in real time.
5. **Break-even salary callout** — "At what annual income does buying this car become financially sensible?" — solve and display this number prominently.
6. **Depreciation prominence** — visually call out depreciation as the dominant cost so users can't miss it.

### Should-have (post-MVP)
7. **Postal code → commute** via OneMap API (distance + estimated commute time)
8. **Car comparison mode** — compare 2–3 cars side by side (different depreciation, fuel economy, insurance)
9. **Scenario saving** — name and save multiple scenarios in localStorage

### Defer to v2
10. **Agentic data fetching** — auto-populate road tax / insurance / parking via AI agent (no public APIs exist; would require browser automation or scraping, brittle for weekend scope)
11. **Live petrol price fetch** — scrape from motorist.sg or similar

---

## Visualisation Ideas

- **Waterfall/stacked bar**: Breakdown of monthly car cost by component (depreciation dominates visually)
- **Line chart with sliders**: X-axis = annual salary, Y-axis = net monthly gap (car − PT + time value). Zero line = break-even. Sliders shift the curve.
- **Inequality scorecard**: A simple summary panel showing whether the inequality holds given current inputs — maybe a qualitative score or colour-coded verdict ("Sensible", "Borderline", "Hard to justify")
- **COE depreciation curve**: Asset value over 10-year COE tenure — shows how car cost front-loads in early years

---

## What I Want from This Session

1. Ask me any clarifying questions before building — especially around: tech stack preference, whether to use a UI component library, any constraints on APIs.
2. Sketch a component architecture or wireframe the dashboard before writing code — I want to align on structure first.
3. Start implementation iteratively, beginning with the wizard + core computation engine, then the dashboard layout, then sliders/charts.
4. Flag any assumptions you're making so we can course-correct early.

Let's begin.
