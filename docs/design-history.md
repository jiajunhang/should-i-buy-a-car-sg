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

---

## V3.1 — Presentation Polish (2026-04-05)

First polish pass before real user testing. Focus: label clarity, tooltip improvements, removing confusing PT mode options, dark mode, slider UX.

### Changes

**Wizard Step 1 (Car Details):**
- sgCarMart hyperlink on purchase price field
- Car name tooltip
- "Fuel Economy" → "Fuel Consumption" label rename
- Improved tooltips for road tax and insurance (NCD guidance)

**Wizard Step 2 (Commute & Lifestyle):**
- Removed PT mode selector (grab/mixed modes) entirely — simplified to single `ptDailyCost` field
- Label: "Average daily transport cost (MRT/bus/grab)"
- Work days tooltip, petrol tooltip (motorist.sg reference)
- Updated defaults: road tax $700, workplace parking $200, petrol $3.00/L, daily transport $5

**Wizard Step 3 (Income & Financing):**
- Annual comp tooltip rewritten to explain "why" (time value calculation)
- Loan tenure auto-clamp bug fix: when COE months < 84, `loanTenureMonths` was not being clamped

**Dashboard:**
- Removed `SliderWithInput` (textbox was confusing due to slider binding). Replaced with `SliderControl` (display-only value)
- Dark mode toggle in header (CSS class toggle on `<html>`, persists to localStorage)
- Simplified PT cost chart from MRT/Bus + Grab bars to single "Transport" bar

### Data Model Changes

```typescript
// REMOVED from LifestyleInputs: grabCostPerTrip, ptMode, grabTripsPerMonth, mrtDailyCost
// ADDED to LifestyleInputs: ptDailyCost (replaces all PT cost fields)
// PTCostBreakdown simplified: { ptMonthly, totalMonthly }
```

---

## V3.2 — Bug Fixes, Read-Only Params, Testing (2026-04-05)

Second polish pass addressing bugs found during hands-on testing. Focus: data binding correctness, removing mutation surfaces that cause inconsistencies, unit test coverage.

### Changes

#### Bug Fixes

**1. Loan tenure auto-set on COE change**
- Problem: `updateCar` only clamped tenure downward (`Math.min`). Changing COE from 60 → 72 months left tenure stuck at 60.
- Fix: when `coeYears` or `coeMonths` changes, always set tenure to `min(newCoeMonths, 84)` instead of just clamping. Predictable and deterministic.

**2. WFH slider max not bound to work days**
- Problem: WFH days slider had hardcoded `max={21}` instead of reading from `scenario.lifestyle.workDaysPerMonth`.
- Fix: `max={scenario.lifestyle.workDaysPerMonth}`.

#### Preventing Data Binding Bugs

**3. Input Parameters panel → read-only**
- Problem: Editable fields on the dashboard created a hidden binding problem. Changing work days in the Assumptions panel didn't update the WFH slider limits. Other similar subtle dependencies likely exist.
- Decision: lock the panel to display-only. The wizard is for data entry; dashboard sliders are for exploration. To change fundamentals, duplicate the scenario and re-run the wizard.
- Implementation: replaced all `<FormField>` inputs with a simple `Field` component (label + formatted value). Removed all `updateCar/updateLifestyle/updateCompensation/updateFinancing` calls from the panel.

**4. Remove tab double-click rename**
- Problem: Renaming via tab wasn't bound to `car.name`, creating inconsistency (tab name diverges from car name field).
- Fix: removed `onDoubleClick` rename entirely. Tab name is always derived from `car.name` via the store's `scenarioName()` helper. One-way binding, no inconsistency possible.

#### Presentation

**5. Page title**
- "Vite + React + TS" → "Should I Buy a Car? — Singapore"

**6. Wizard commute section restructured**
- Problem: Commute distance (one-way) appeared as a wide field spanning both columns, making it unclear whether it referred to driving or PT distance.
- Fix: split the Commute Time card into three sub-sections with icons: **Driving** (drive time + driving distance), **Public Transport** (PT time + daily cost), **Work Schedule** (work days + WFH days). Clear visual separation.

**7. Chart header icons**
- Added missing icons to three chart cards for consistency:
  - Monthly Car Cost Breakdown → `BarChart3`
  - Car vs Public Transport → `Scale`
  - Sensitivity → `TrendingUp`

**8. Financing verdict wording**
- "Paying cash saves ~$X/mo..." → "Paying in full cash is better — saves ~$X/mo..."
- "Taking a loan saves ~$X/mo..." → "Taking a loan is better — saves ~$X/mo..."
- Clearer — avoids ambiguity about what "paying cash" means in a loan context.

#### Testing

**9. Vitest unit test suite (NEW)**
- Added `vitest` (v2.x) as dev dependency with `npm test` and `npm run test:watch` scripts.
- 54 tests across 6 test files covering the entire computation layer:
  - `carCosts.test.ts` — depreciation, fuel, parking, scrap value, COE months, cost totals
  - `ptCosts.test.ts` — daily cost × commute days, WFH reduction
  - `timeValue.test.ts` — cost per minute, time savings, salary/WFH sensitivity
  - `breakEven.test.ts` — break-even salary existence, edge cases (no time savings, car cheaper)
  - `financing.test.ts` — loan amortisation, cash vs loan comparison, edge cases
  - `analysis.test.ts` — full scenario analysis, verdict thresholds, net gap computation
- All pure functions, no React dependencies. Runs in <400ms.

### Data Model (end of v3.2)

No schema changes from v3.1. Same `Scenario` type.

### Deferred to V4+

- OneMap API integration (postal code → commute time)
- sgCarMart URL paste → auto-populate car details
- Weekend mileage presentation review
- Live petrol price fetch
- Car comparison mode (multi-car side-by-side)
- Copy/export summary feature
- Grab/mixed transport modes (removed in v3.1, may revisit with better UX)

---

## V3.3 — Critical Loan Fix, Weekend Mileage Removal (2026-04-05)

### Changes

**1. Critical bug: Singapore flat-rate loan calculation**
- Our code used standard amortisation (reducing balance interest), but Singapore car loans use **flat-rate interest**: interest is calculated on the original principal for the full term.
- Formula: `totalInterest = principal × flatRate × years`, `monthlyRepayment = (principal + totalInterest) / tenureMonths`
- Verified against sgCarMart: 126,800 principal @ 2.48% × 7yr = $22,012 interest, $1,772/mo.
- Renamed functions: `computeAmortisedRepayment` → `computeFlatRateInterest` + `computeLoanRepaymentMonthly`.

**2. Weekend mileage removed**
- Hard to estimate, not used in the core inequality, added cognitive load.
- Removed `weekendMileageKm` from `LifestyleInputs`, defaults, wizard, dashboard, computation, and charts.
- Simplified `CarCostBreakdown`: removed `fuelWeekendMonthly`, `totalCommuteMonthly`, `totalOwnershipMonthly`. Now just `fuelCommuteMonthly` and `totalMonthly`.

**3. Wizard intro context**
- Added "How this tool works" info box on Step 1 explaining the tool's purpose: collect inputs → compute time-value comparison → dashboard. "Rough figures are fine."

### Data Model Changes

```
// REMOVED: LifestyleInputs.weekendMileageKm
// SIMPLIFIED: CarCostBreakdown → { depreciationMonthly, roadTaxMonthly, insuranceMonthly, parkingMonthly, fuelCommuteMonthly, totalMonthly }
```

---

## V4 — UX Overhaul, EV Support, Computation Transparency (2026-04-05/06)

Major UX overhaul driven by user feedback. Core theme: reduce friction, increase clarity, add missing cost components.

### Changes

#### Wizard UX

**1. COE remaining → dropdown selectors**
- Years (0–10) and months (0–11) as `<select>` instead of free-text inputs. Faster, less error-prone.

**2. Commute fields → daily averages**
- Removed "one-way" framing. All commute fields now represent daily totals (round trip):
  - `driveTimeMinutesOneWay` → `driveTimeMinutesDaily` (default 60)
  - `ptTimeMinutesOneWay` → `ptTimeMinutesDaily` (default 120)
  - `commuteDistanceKm` → `commuteDistanceKmDaily` (default 40)
- Consistent with "average daily transport cost" framing. Removed all `*2` multipliers from computation layer.

**3. Work schedule collapsed**
- Replaced `workDaysPerMonth` + `wfhDaysPerMonth` with single `commuteDaysPerMonth` field (default 21).
- Works for any user type — office worker, freelancer, shift worker. One fewer field.

**4. Renamed "HDB Season Parking" → "Residential Parking"**
- Not everyone lives in HDB. Generic label is more inclusive.

**5. Added ERP/Cashcard + Annual Maintenance fields**
- Both are non-trivial car ownership costs previously missing from the calculation.
- `erpCashcardMonthly` (default $50/mo), `annualMaintenance` (default $1,200/yr, divided by 12 internally).
- Maintenance input is annual because that's how people mentally budget it.

**6. Income sliders**
- Annual compensation: slider + editable input combo (1k/tick). Drag for rough value, type for exact.
- Hours worked/day: slider (4–16 hrs, 0.5 step).

**7. Financing fields → sliders in wizard**
- Investment return, down payment, loan interest rate, loan tenure — all sliders matching dashboard.
- Loan tenure: 1-month step (not 6-month).

**8. EV support (NEW)**
- Added `fuelType: 'petrol' | 'ev'` toggle in Step 1 (Car Details).
- Petrol: existing `fuelEconomyKmPerL` + `petrolPricePerL` fields.
- EV: `evEfficiencyKmPerKwh` (default 6.0) + `electricityPricePerKwh` (default $0.33).
- Computation layer handles both via `computeCommuteFuelMonthly()` branching on fuel type.
- Wizard, assumptions panel, and running costs fields all adapt based on selection.

#### Dashboard — Verdict Panel Rewrite

**9. Clear labels replacing opaque "gap" terminology**
- "Monthly gap (without time)" → **"Extra cost of driving"** with dynamic sublabel stating the dollar amount and direction.
- "Monthly gap (with time value)" → **"Net premium after time savings"** with dynamic sublabel: when positive, "driving is still $X/mo more expensive"; when negative, "driving is actually $X/mo cheaper."

**10. Inequality visualization**
- Shows `Car (financial + time) ≤ PT (financial + time)` with the actual dollar amounts.
- Each side shows breakdown: financial cost + time cost separately labeled.
- `≤` / `>` symbol colored green/red based on verdict.

**11. Expandable cost breakdown in verdict**
- "Show breakdown" button reveals a table-aligned view of all car cost components vs PT cost.
- Both columns use a shared table layout so Totals and Time Cost rows are always horizontally aligned.

**12. Intangibles note**
- When net premium is positive (car costs more): "This $X/mo is what you'd pay for convenience, on-demand travel, driving enjoyment, and easily visiting family."
- User feedback: "this is very good and insightful."

#### Dashboard — Computation Transparency

**13. Financing table: click-to-expand rows**
- Each row (upfront, monthly repayment, total interest, opportunity cost, effective cost) is clickable.
- Expanded detail shows exact formulas with numbers, e.g. `$126,800 × 2.48% × 84mo ÷ 12 = $22,012`.
- Expansion respects 3-column layout — cash calcs under "Full Cash", loan calcs under "Bank Loan".
- Table uses `table-layout: fixed` (40%/30%/30%) to prevent column width jumping on expand.

**14. Time Value panel: click-to-expand rows**
- Monthly commute time cost (car), (PT), and time value of driving — all expandable inline with step-by-step formulas.

**15. Loan tenure slider in dashboard**
- Added to financing overlay (12 to min(COE, 84) months, 1-month step). Joins existing sliders for return rate, loan rate, and down payment.

#### Dashboard — Layout & Navigation

**16. Panel reorder**
- Top-to-bottom: Verdict → Input Params → Explore Sliders → Break-even + Time Value (2-col) → Sensitivity → Financing → Cost Breakdown Charts.
- Most critical insights at top; straightforward charts at bottom.

**17. "Edit Inputs" button**
- Replaces "duplicate to re-run wizard" pattern. Button on dashboard sends user back to wizard step 0 for the same scenario.
- Removed `duplicateScenario` feature entirely (served no purpose without input editing).

**18. All "PT" → "Public Transport"**
- Expanded acronym everywhere in the UI for clarity.

#### Computation Fix

**19. Opportunity cost: removed ÷2 approximation**
- Previously used average capital tied up: `(purchasePrice + scrapValue) / 2`. This assumes you could liquidate at depreciated value at any time.
- Simplified to: `purchasePrice × returnRate / 12`. Full purchase price is out of your portfolio from day one. Consistent with loan side (downPayment × rate / 12).
- Simpler, more intuitive, avoids user confusion.

### Data Model (end of v4)

```typescript
type FuelType = 'petrol' | 'ev'

CarInputs {
  name, purchasePrice, annualDepreciation, coeYears, coeMonths,
  fuelType: FuelType,           // NEW — petrol or ev
  fuelEconomyKmPerL,            // petrol
  evEfficiencyKmPerKwh,         // NEW — EV km per kWh
  annualInsurance, annualRoadTax,
  erpCashcardMonthly,           // NEW — ERP + cashcard estimate
  annualMaintenance,            // NEW — annual servicing/tyres/repairs
}

LifestyleInputs {
  driveTimeMinutesDaily,        // RENAMED — was driveTimeMinutesOneWay
  ptTimeMinutesDaily,           // RENAMED — was ptTimeMinutesOneWay
  commuteDistanceKmDaily,       // RENAMED — was commuteDistanceKm
  commuteDaysPerMonth,          // NEW — replaces workDaysPerMonth + wfhDaysPerMonth
  residentialParkingMonthly,    // RENAMED — was hdbSeasonParkingMonthly
  workplaceParkingMonthly,
  petrolPricePerL,
  electricityPricePerKwh,       // NEW — EV charging cost
  ptDailyCost,
}

CarCostBreakdown {
  depreciationMonthly, roadTaxMonthly, insuranceMonthly, parkingMonthly,
  fuelCommuteMonthly,           // handles both petrol and EV
  erpCashcardMonthly,           // NEW
  maintenanceMonthly,           // NEW
  totalMonthly,
}
```

### Deferred to V5+

- OneMap API integration (postal code → commute time)
- sgCarMart URL paste → auto-populate car details
- Live petrol price fetch
- Car comparison mode (multi-car side-by-side)
- Copy/export summary feature
