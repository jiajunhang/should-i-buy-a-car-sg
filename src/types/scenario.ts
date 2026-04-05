export type FuelType = 'petrol' | 'ev'

export interface CarInputs {
  name: string
  purchasePrice: number
  annualDepreciation: number  // primary input from sgcarmart
  coeYears: number            // user input: years portion of COE remaining
  coeMonths: number           // user input: months portion of COE remaining
  fuelType: FuelType
  fuelEconomyKmPerL: number   // petrol: km per litre
  evEfficiencyKmPerKwh: number // EV: km per kWh
  annualInsurance: number
  annualRoadTax: number
  erpCashcardMonthly: number  // ERP + cashcard estimate
  annualMaintenance: number   // servicing, tyres, misc repairs (annual)
}

// Derived helpers (not stored)
export function getCoeMonthsRemaining(car: CarInputs): number {
  return car.coeYears * 12 + car.coeMonths
}

export function getScrapValue(car: CarInputs): number {
  const tenureYears = getCoeMonthsRemaining(car) / 12
  return Math.max(0, car.purchasePrice - car.annualDepreciation * tenureYears)
}

export interface LifestyleInputs {
  // Commute — all values are daily averages (round trip)
  driveTimeMinutesDaily: number   // avg total driving time per day
  ptTimeMinutesDaily: number      // avg total PT time per day
  commuteDistanceKmDaily: number  // avg total driving distance per day
  commuteDaysPerMonth: number     // days you'd commute
  // Parking
  residentialParkingMonthly: number
  workplaceParkingMonthly: number
  // Energy costs
  petrolPricePerL: number          // petrol: price per litre
  electricityPricePerKwh: number   // EV: price per kWh
  // PT costs
  ptDailyCost: number         // average daily transport cost (MRT/bus/grab)
}

export interface CompensationInputs {
  annualTotalComp: number
  hoursWorkedPerDay: number   // default 9
  costPerMinuteOverride: number | null
}

export interface FinancingInputs {
  // Cash scenario
  cashInvestmentReturnPct: number   // default 4.0%
  // Loan scenario
  loanDownPayment: number
  loanInterestRatePct: number       // default 2.78%
  loanTenureMonths: number          // auto: min(coeMonthsRemaining, 84)
}

export interface Scenario {
  id: string
  name: string
  car: CarInputs
  lifestyle: LifestyleInputs
  compensation: CompensationInputs
  financing: FinancingInputs
  wizardStep: number | 'complete'   // per-scenario wizard state
  createdAt: number
}

export interface CarCostBreakdown {
  depreciationMonthly: number
  roadTaxMonthly: number
  insuranceMonthly: number
  parkingMonthly: number
  fuelCommuteMonthly: number
  erpCashcardMonthly: number
  maintenanceMonthly: number
  totalMonthly: number
}

export interface PTCostBreakdown {
  ptMonthly: number
  totalMonthly: number
}

export interface TimeValueResult {
  costPerMinute: number
  costPerHour: number
  carCommuteTimeCostMonthly: number
  ptCommuteTimeCostMonthly: number
  timeSavingsMonthly: number       // positive = car saves time (minutes)
  timeSavingsValueMonthly: number
}

export interface FinancingComparison {
  // Cash scenario
  cashUpfront: number
  cashOpportunityCostMonthly: number   // returns forgone on full purchase price
  // Loan scenario
  loanUpfront: number                  // down payment
  loanMonthlyRepayment: number
  loanTotalInterest: number
  loanInterestCostMonthly: number      // total interest / tenure months
  loanOpportunityCostMonthly: number   // returns forgone on down payment only
  // Comparison
  cashEffectiveMonthlyCost: number     // opportunity cost
  loanEffectiveMonthlyCost: number     // interest + dp opportunity cost
  financingAdvantage: 'cash' | 'loan' | 'neutral'
  monthlySavings: number               // absolute difference
}

export interface AnalysisResult {
  carCosts: CarCostBreakdown
  ptCosts: PTCostBreakdown
  timeValue: TimeValueResult
  financing: FinancingComparison
  netGapWithoutTime: number     // PT - car commute costs (negative = car costs more)
  netGapWithTime: number        // above + time savings value
  breakEvenSalary: number | null
  verdict: 'sensible' | 'borderline' | 'hard-to-justify'
}
