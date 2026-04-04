export interface CarInputs {
  name: string
  purchasePrice: number
  annualDepreciation: number  // primary input from sgcarmart
  scrapValue: number          // auto-computed or manually entered
  coeMonthsRemaining: number  // precise months remaining on COE
  fuelEconomyKmPerL: number
  annualInsurance: number
  annualRoadTax: number
}

export interface LifestyleInputs {
  // Commute (manual only for v2, auto-estimate deferred)
  driveTimeMinutesOneWay: number
  ptTimeMinutesOneWay: number
  commuteDistanceKm: number   // one-way driving distance
  // Work schedule
  workDaysPerMonth: number    // default 21
  wfhDaysPerMonth: number     // default 0
  // Weekend mileage (excluded from comparison, shown for budgeting)
  weekendMileageKm: number    // per month
  // Parking
  hdbSeasonParkingMonthly: number
  workplaceParkingMonthly: number
  // Petrol
  petrolPricePerL: number     // default RON95 ~3.40
  // PT costs
  mrtDailyCost: number        // default ~4.30
  grabCostPerTrip: number     // default ~25
  ptMode: 'mrt' | 'grab' | 'mixed'
  grabTripsPerMonth: number   // for mixed mode
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
  createdAt: number
}

export interface CarCostBreakdown {
  depreciationMonthly: number
  roadTaxMonthly: number
  insuranceMonthly: number
  parkingMonthly: number
  fuelCommuteMonthly: number      // commute fuel only (used in comparison)
  fuelWeekendMonthly: number      // weekend fuel (budgeting only)
  totalCommuteMonthly: number     // used in inequality comparison
  totalOwnershipMonthly: number   // includes weekend fuel (for budgeting)
}

export interface PTCostBreakdown {
  mrtBusMonthly: number
  grabMonthly: number
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
  cashEffectiveMonthlyCost: number     // depreciation + running + opportunity cost
  loanEffectiveMonthlyCost: number     // depreciation + running + interest + dp opportunity cost
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
