# Should I Buy A Car (Singapore)

A client-side web tool helping Singaporean users decide whether car ownership is financially sensible compared to public transport, incorporating time-value-of-money analysis.

## Tech Stack

- **Framework:** React 18 + TypeScript (Vite)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Charts:** Recharts
- **State:** Zustand with localStorage persistence
- **Routing:** React Router v6
- **Deployment:** Vercel (static SPA)

## Architecture Principles

- All computation is client-side. No backend for MVP.
- Computation engine (`src/computation/`) is pure TypeScript functions with zero React dependency. Must be independently unit-testable.
- Every user-facing number must be overridable — no hard-coded values the user can't change.
- The wizard is a one-time onboarding flow. The dashboard's "Assumptions Panel" is the persistent source of truth for all inputs.
- A "scenario" is the core data unit: one car + one set of lifestyle/comp inputs + one financing choice.
- Scenarios are stored as an array in Zustand, persisted to localStorage.

## Key Domain Concepts

- **The core inequality:** Car financial cost + Car commute time cost <= PT financial cost + PT commute time cost
- **Time value:** Monetised using annual total compensation. Cost per minute = (Annual comp / 12 / 21 / 9 / 60).
- **Break-even salary:** The annual income at which the inequality flips. Derived algebraically (closed-form, no solver needed).
- **Economic cost vs Cash flow:** Depreciation-based analysis (finance-agnostic) is the primary view. Loan/cash flow is a secondary overlay.

## Project Structure

```
src/
├── components/
│   ├── wizard/          # Step1_Car, Step2_Life, Step3_Comp
│   ├── dashboard/       # All dashboard panels and charts
│   └── ui/              # shadcn/ui components
├── computation/         # Pure TS functions
│   ├── carCosts.ts
│   ├── ptCosts.ts
│   ├── timeValue.ts
│   ├── breakEven.ts
│   └── loanModel.ts
├── store/
│   └── scenarioStore.ts
├── lib/                 # Utilities, API clients (OneMap)
└── types/               # Shared TypeScript interfaces
```

## Design Decisions Log

- Wizard inputs are duplicated as editable fields in the dashboard's Assumptions Panel
- Commute input supports two modes: Manual (user types times) or Auto-estimate (OneMap API)
- Car comparison is scenario-based: each tab is a full scenario, with a condensed comparison view
- sgcarmart integration deferred to v2 (requires backend proxy due to CORS)
- OneMap API used for commute estimation (free, no API key required for basic routing)
