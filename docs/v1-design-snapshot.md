# V1 Design Snapshot — 2026-04-04

## Problem

Evaluating car ownership in Singapore requires manually researching scattered cost components (depreciation, road tax, insurance, parking, fuel, loan interest) and comparing against public transport alternatives. The time-value-of-money angle — where higher-income users recoup costs through commute time savings — is non-obvious and requires explicit calculation. No existing tool surfaces this insight interactively.

## Solution

A client-side React web tool with:
1. A 3-step onboarding wizard to collect car, lifestyle, and compensation inputs
2. A live dashboard that computes and visualises the full cost comparison
3. Interactive sliders for real-time sensitivity analysis
4. Scenario-based architecture supporting multi-car comparison

## Core Inequality

```
Car monthly cost + (Car commute time × cost per minute) ≤ PT monthly cost + (PT commute time × cost per minute)
```

Where cost per minute = Annual comp ÷ 12 ÷ 21 ÷ 9 ÷ 60.

## Cost Components (Monthly)

**Car:** Depreciation + Road tax + Insurance + Season parking + Fuel + Financing cost (interest or opportunity cost)
**Public transport:** MRT/bus fare OR Grab cost (user selects primary mode)

## Agreed Architecture

- **Computation engine:** Pure TypeScript functions, no framework dependency. Independently testable.
- **State:** Zustand store holding an array of scenarios, persisted to localStorage.
- **Dashboard > Wizard:** The wizard is onboarding only. All inputs live in an editable Assumptions Panel on the dashboard. Users never re-enter the wizard to change values.
- **Scenarios:** Core data unit. Each scenario = one car + lifestyle + comp + financing. Tabs to switch, condensed comparison view for side-by-side.
- **Commute input:** Segmented control — Manual (user types drive/PT times) or Auto-estimate (OneMap API fills both, user can override).

## Two Financial Views

1. **Economic cost (primary):** Depreciation-based. Finance-agnostic. Shows true cost of car ownership.
2. **Cash flow (secondary toggle):** Shows actual monthly bank outflow. Accounts for loan repayment or lump sum. Clearly labelled as budgeting view, not economic cost.

Financing overlay shows: opportunity cost (if cash purchase, what returns you forgo) or interest cost (if loan, total interest amortised monthly).

## MVP Features

1. Wizard onboarding (3 steps)
2. Auto-computed cost breakdown with sensible defaults
3. Inequality dashboard — Car vs PT, with and without time value
4. Interactive sliders — salary, time saved, WFH days
5. Break-even salary callout
6. Depreciation visual prominence (stacked bar)
7. Editable Assumptions Panel (all wizard inputs, always accessible)
8. Scenario tabs + comparison view

## Deferred (v2)

- sgcarmart URL paste → auto-populate car details (needs backend proxy)
- Live petrol price fetch
- Agentic data fetching (road tax, insurance lookups)
- OneMap postal code → commute auto-estimation (may be pulled into MVP if time permits)

## Tech Stack

React 18 + TypeScript + Vite / Tailwind CSS + shadcn/ui / Recharts / Zustand / React Router v6 / Vercel
