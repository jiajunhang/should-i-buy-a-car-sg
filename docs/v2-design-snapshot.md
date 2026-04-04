# V2 Design Snapshot — 2026-04-04

## Context

V2 iteration based on user testing of v1. Changes target precision, usability, and a missing financing comparison feature. Approximately 70-80% of v1 aligned with the vision; this iteration addresses the remaining gaps.

## Changes from V1

### Step 1: Your Car

1. **Depreciation as primary input** — sgcarmart shows annual depreciation directly, so accept that instead of requiring scrap value calculation. Bi-directional auto-fill: purchase price + depreciation → scrap value, or purchase price + scrap value → depreciation.
2. **COE tenure in months** — sgcarmart shows years/months/days precision. Field changed from years to months. Label: "COE Months Remaining". Used to auto-compute max loan tenure.
3. **Remove engine displacement field** — road tax is directly available on sgcarmart; deriving it from CC is unnecessary indirection.

### Step 2: Your Life

4. **Hide auto-estimate commute button** — OneMap API requires token registration and has inconsistent CORS behavior. Removed entirely rather than showing a disabled/coming-soon state.
5. **Fix 0-value display bug** — JS falsy `0 || ''` evaluates to `''`. Fix: use explicit null/undefined check. Applies to all numeric FormField instances globally.
6. **Weekend mileage: separate from comparison** — Core inequality compares commute-only costs. Weekend mileage moved to a supplementary "Non-commute costs" line in the cost breakdown, clearly labelled as "for budgeting only, not used in comparison". Implemented with caution — must not clutter the UI. Subject to review in v3.

### Step 3: Your Compensation

7. **Add hours worked per day** — Current formula hardcodes 9 hours. New field with default 9, affects cost-per-minute calculation. Formula: `annualComp / 12 / workDaysPerMonth / hoursPerDay / 60`.
8. **Show hourly rate** — Display alongside per-minute rate for context.
9. **Collect BOTH financing inputs** — No toggle between cash/loan. Wizard collects all data for both scenarios simultaneously:
   - Cash section: expected investment return rate (default 4%)
   - Loan section: down payment, loan interest rate (default 2.78%)
   - Loan tenure auto-computed as `min(coeMonthsRemaining, 84)`, overridable
   This enables the financing comparison on the dashboard without forcing a choice.

### Step 4: Dashboard

10. **Tab renaming** — Double-click on tab name to edit inline.
11. **Last scenario close behavior** — Closing the last scenario creates a fresh blank scenario on the dashboard (not redirect to wizard).
12. **Assumptions panel visual cleanup** — Bolder section headers with visual separators, standardized input field widths, consistent unit display. Cautious approach — no drastic layout changes.
13. **Slider granularity + inline textbox** — Annual comp slider: $1k steps. Time saved slider: 1-minute steps, label changed to "Minutes Saved Per Day (Driving vs PT)". Each slider gets an inline editable textbox for precision entry, bidirectionally bound to the same store value as the Assumptions Panel fields.
14. **Financing overlay (NEW)** — Major new dashboard section:
    - **View A: Cash vs Loan comparison table** — Side-by-side showing upfront payment, monthly repayment, total interest, opportunity cost, effective monthly financing cost. Key insight: when loan rate < investment return rate, borrowing is cheaper.
    - **View B: Interactive sliders** — Investment return rate (1-8%), loan interest rate (1.5-5%), down payment amount ($0 to purchase price). Live-updating table + line chart showing optimal financing split.
    - Core formula: Cash opportunity cost = capitalTiedUp × returnRate / 12. Loan cost = totalInterest / tenureMonths. Net advantage = cash opportunity cost − loan cost.

## Data Model Changes

### CarInputs
- ADD: `annualDepreciation: number` (primary input)
- CHANGE: `coeTenureYears` → `coeMonthsRemaining: number`
- REMOVE: `engineCC`
- KEEP: `scrapValue` (auto-computed from price - depreciation × tenure, or manually entered)

### LifestyleInputs
- CHANGE: `weekendMileageKm` retained but excluded from comparison calculation, used only in total ownership cost display
- REMOVE: `commuteMode` field (auto-estimate hidden), `homePostalCode`, `workPostalCode`

### CompensationInputs
- ADD: `hoursWorkedPerDay: number` (default 9)

### FinancingInputs
- CHANGE: structure to hold BOTH scenarios simultaneously:
  ```
  {
    cashInvestmentReturnPct: number     // default 4.0
    loanDownPayment: number
    loanInterestRatePct: number         // default 2.78
    loanTenureMonths: number            // auto: min(coeMonths, 84)
    loanTenureOverride: number | null   // user override
  }
  ```

## Deferred to V3+
- OneMap API integration (postal code → commute time)
- sgcarmart URL paste → auto-populate car details
- Weekend mileage presentation review
- Live petrol price fetch
- Car comparison mode (multi-car side-by-side)

## Tech Stack
Unchanged from v1: React 18 + TypeScript + Vite / Tailwind CSS + shadcn/ui / Recharts / Zustand / React Router v6
