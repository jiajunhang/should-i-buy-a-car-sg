# Design History — Should I Buy a Car (SG)

Unified design document tracking all iterations. Each section captures the agreed changes, data model state, and deferred items at that version boundary.

---

## V1 — Initial MVP (2026-04-04)

### Problem

Evaluating car ownership in Singapore requires manually researching scattered cost components (depreciation, road tax, insurance, parking, fuel, loan interest) and comparing against public transport alternatives. The time-value-of-money angle — where higher-income users recoup costs through commute time savings — is non-obvious and requires explicit calculation. No existing tool surfaces this insight interactively.

### Solution

A client-side React web tool with:
1. A 3-step onboarding wizard to collect car, lifestyle, and compensation inputs
2. A live dashboard that computes and visualises the full cost comparison
3. Interactive sliders for real-time sensitivity analysis
4. Scenario-based architecture supporting multi-car comparison

### Core Inequality

```
Car monthly cost + (Car commute time x cost per minute) <= PT monthly cost + (PT commute time x cost per minute)
```

Where cost per minute = Annual comp / 12 / workDays / hoursPerDay / 60.

### Cost Components (Monthly)

- **Car:** Depreciation + Road tax + Insurance + Season parking + Fuel + Financing cost (interest or opportunity cost)
- **Public transport:** MRT/bus fare OR Grab cost (user selects primary mode)

### Architecture

- **Computation engine:** Pure TypeScript functions, no framework dependency. Independently testable.
- **State:** Zustand store holding an array of scenarios, persisted to localStorage.
- **Wizard > Dashboard:** Wizard is onboarding only. All inputs editable via Assumptions Panel on dashboard.
- **Scenarios:** Core data unit. Each scenario = one car + lifestyle + comp + financing. Tabs to switch.
- **Two financial views:** Economic cost (depreciation-based, primary) and cash flow (loan repayment, secondary).

### Tech Stack

React 18 + TypeScript + Vite / Tailwind CSS v4 + shadcn/ui / Recharts / Zustand / React Router v6 / Vercel

---

## V2 — Precision, Usability, Financing (2026-04-04)

Based on user testing of v1. ~70-80% of v1 aligned with vision; this iteration addresses remaining gaps.

### Changes

**Step 1 (Car):**
1. Depreciation as primary input (matches sgCarMart listing). Bi-directional auto-fill between depreciation and scrap value.
2. COE tenure changed from years to months. Used to auto-compute max loan tenure.
3. Removed engine displacement field (road tax available directly on sgCarMart).

**Step 2 (Lifestyle):**
4. Removed auto-estimate commute (OneMap API deferred). Manual input only.
5. Fixed 0-value display bug (`0 || ''` → explicit null/undefined check).
6. Weekend mileage separated from comparison — shown for budgeting only, not in inequality.

**Step 3 (Compensation):**
7. Added hours worked per day (default 9), affects cost-per-minute.
8. Shows both hourly and per-minute rate.
9. Collects BOTH cash and loan financing inputs simultaneously (no toggle).

**Dashboard:**
10. Tab renaming via double-click.
11. Last scenario deletion creates fresh blank scenario.
12. Assumptions panel visual cleanup — bold section headers, separators.
13. Slider granularity + inline textbox — $1k steps for salary, 1-minute steps for time, bidirectionally bound.
14. **Financing overlay (NEW):** Cash vs Loan comparison table, verdict with explanation, 3 interactive sliders (investment return, loan interest, down payment), line chart.

### Data Model (end of v2)

```typescript
CarInputs { name, purchasePrice, annualDepreciation, scrapValue, coeMonthsRemaining, fuelEconomyKmPerL, annualInsurance, annualRoadTax }
LifestyleInputs { driveTimeMinutesOneWay, ptTimeMinutesOneWay, commuteDistanceKm, workDaysPerMonth, wfhDaysPerMonth, weekendMileageKm, hdbSeasonParkingMonthly, workplaceParkingMonthly, petrolPricePerL, mrtDailyCost, grabCostPerTrip, ptMode, grabTripsPerMonth }
CompensationInputs { annualTotalComp, hoursWorkedPerDay, costPerMinuteOverride }
FinancingInputs { cashInvestmentReturnPct, loanDownPayment, loanInterestRatePct, loanTenureMonths }
```

---

## V3 — UX Overhaul, Wizard-per-Scenario (2026-04-04)

Based on multi-hour user testing of v2. Focus: UX consistency, removing confusion around wizard/scenario lifecycle, presentation polish.

### Changes

#### Core Functionality

**1. COE input as years + months, scrap value read-only**
- Replace single `coeMonthsRemaining` field with `coeYears` + `coeMonths` (matching sgCarMart listing format).
- Auto-compute `coeMonthsRemaining` as a derived value (read-only display).
- Scrap value becomes **always derived** from `purchasePrice - annualDepreciation * (coeMonthsRemaining / 12)`. No longer user-editable. Label updated to "Estimated Scrap Value" with tooltip explaining derivation.
- Eliminates bi-directional sync bugs between wizard and assumptions panel.
- Data model: `CarInputs` adds `coeYears: number` and `coeMonths: number`. `coeMonthsRemaining` becomes a computed value (not stored). `scrapValue` removed from stored inputs, computed on the fly.

**2. Fix 0-value backspace bug**
- Controlled `<input type="number" value={0}>` prevents backspace because empty string coerces to 0 immediately.
- Fix: allow empty string as transient editing state, coerce to 0 on blur only.

**3. Remove financing down-payment-vs-cost chart**
- The line chart (cash opportunity cost flat line vs loan cost curve) does not provide clear actionable insight.
- The comparison table + sliders + verdict already communicate the tradeoff clearly.
- Remove the `<LineChart>` and surrounding container from `FinancingOverlay`. Keep table, sliders, and verdict.

**4. Minutes saved slider: min = 0**
- Negative "minutes saved" is confusing — if driving is slower than PT, the tool's premise shifts.
- Slider `min` changed from `-60` to `0`.
- If user's actual inputs result in negative time savings (drive > PT time), show a note: "Driving is slower than PT for your commute — car ownership is harder to justify on time value alone."

#### Presentation / UX

**5. Scenario naming defaults to car name**
- `createScenario()` no longer generates "Scenario 1", "Scenario 2" etc.
- Scenario name is always synced from `car.name`. When user updates car name in Step 1 or Assumptions, the tab name updates.
- Fallback: "New Car" if car name is empty.

**6. Static tagline, remove dynamic subtitle**
- Remove "BMW 318i — full cost analysis" dynamic subtitle from dashboard header.
- Replace with static: "A data-driven tool for Singapore car ownership decisions" (or remove subtitle entirely).

**7. Rename labels**
- "Your Assumptions" → "Input Parameters"
- "Your Car" (wizard step 1) → "Car Details"
- "Your Life" (wizard step 2) → "Commute & Lifestyle"
- "Your Compensation" (wizard step 3) → "Income & Financing"

**8. Wizard-per-scenario architecture (MAJOR)**

Problem: v2's global wizard + shared dashboard creates UX confusion:
- Can't start fresh without stale data carrying over
- "Back to wizard" mutates current scenario unexpectedly
- New scenarios start on dashboard without wizard guidance
- Can't delete the only scenario

Solution: Each scenario owns its own wizard lifecycle.

- `Scenario` type gains `wizardStep: number | 'complete'` (replaces global `wizardCompleted` boolean).
- **Remove React Router entirely.** App is a single-page layout: tabs at top, content below (wizard or dashboard per active scenario).
- **Creating a new scenario** (+ tab) always starts with a fresh wizard at step 1.
- **Completing the wizard** transitions that scenario's tab to dashboard view.
- **All editing after wizard** happens via the Input Parameters panel on the dashboard. No "back to wizard" button.
- **Deleting the last scenario** resets it to fresh defaults and sends user back to step 1 of the wizard for that tab. There is always exactly one tab.
- **Tab label** shows car name (from Step 1 input). Updated live as user types.

### Data Model (end of v3)

```typescript
CarInputs {
  name: string
  purchasePrice: number
  annualDepreciation: number
  coeYears: number                // NEW — user input
  coeMonths: number               // NEW — user input
  fuelEconomyKmPerL: number
  annualInsurance: number
  annualRoadTax: number
}
// REMOVED from CarInputs: scrapValue, coeMonthsRemaining (both derived)
// Computed: coeMonthsRemaining = coeYears * 12 + coeMonths
// Computed: scrapValue = purchasePrice - annualDepreciation * (coeMonthsRemaining / 12)

Scenario {
  id: string
  name: string                    // synced from car.name, fallback "New Car"
  car: CarInputs
  lifestyle: LifestyleInputs      // unchanged from v2
  compensation: CompensationInputs // unchanged from v2
  financing: FinancingInputs      // unchanged from v2
  wizardStep: number | 'complete' // NEW — replaces global wizardCompleted
  createdAt: number
}
```

### Deferred to V4+

- OneMap API integration (postal code → commute time)
- sgCarMart URL paste → auto-populate car details
- Weekend mileage presentation review
- Live petrol price fetch
- Car comparison mode (multi-car side-by-side)
- COE days precision (deferred — negligible impact on accuracy)

### Tech Stack Changes

- **Removed:** React Router v6 (no longer needed — single-page tab-based architecture)
- Rest unchanged from v2
