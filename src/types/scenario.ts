export interface CarInputs {
  name: string
  purchasePrice: number
  scrapValue: number       // PARF rebate + scrap value at end of COE
  coeTenureYears: number   // typically 10
  engineCC: number         // for road tax estimation
  fuelEconomyKmPerL: number
  annualInsurance: number
  annualRoadTax: number
}

export interface LifestyleInputs {
  commuteMode: 'manual' | 'auto'
  // Manual mode
  driveTimeMinutesOneWay: number
  ptTimeMinutesOneWay: number
  commuteDistanceKm: number   // one-way
  // Auto mode
  homePostalCode: string
  workPostalCode: string
  // Shared
  workDaysPerMonth: number    // default 21
  wfhDaysPerMonth: number     // default 0
  weekendMileageKm: number    // per month
  // Parking
  hdbSeasonParkingMonthly: number
  workplaceParkingMonthly: number
  // Petrol
  petrolPricePerL: number     // default RON95 ~3.40
  // PT costs
  mrtDailyCost: number        // default ~4.30
  grabCostPerTrip: number     // default ~80
  ptMode: 'mrt' | 'grab' | 'mixed'
  grabTripsPerMonth: number   // for mixed mode
}

export interface CompensationInputs {
  annualTotalComp: number
  // Derived but overridable
  costPerMinuteOverride: number | null
}

export interface FinancingInputs {
  mode: 'cash' | 'loan'
  // Loan specifics
  downPayment: number
  loanInterestRatePct: number  // annual percentage
  loanTenureYears: number
  // Opportunity cost (cash mode)
  investmentReturnRatePct: number // annual percentage, default ~4%
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
  fuelMonthly: number
  financingCostMonthly: number  // interest (loan) or opportunity cost (cash)
  totalMonthly: number
}

export interface PTCostBreakdown {
  mrtBusMonthly: number
  grabMonthly: number
  totalMonthly: number
}

export interface TimeValueResult {
  costPerMinute: number
  carCommuteTimeCostMonthly: number
  ptCommuteTimeCostMonthly: number
  timeSavingsMonthly: number   // positive = car saves time
  timeSavingsValueMonthly: number
}

export interface AnalysisResult {
  carCosts: CarCostBreakdown
  ptCosts: PTCostBreakdown
  timeValue: TimeValueResult
  netGapWithoutTime: number     // car - PT (negative means car costs more)
  netGapWithTime: number        // above + time savings value
  breakEvenSalary: number | null // null if car is always cheaper or never sensible
  verdict: 'sensible' | 'borderline' | 'hard-to-justify'
}
