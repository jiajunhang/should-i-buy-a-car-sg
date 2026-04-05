import type { CarInputs, LifestyleInputs, CompensationInputs, FinancingInputs } from '@/types/scenario'

export const DEFAULT_CAR: CarInputs = {
  name: '',
  purchasePrice: 150000,
  annualDepreciation: 15000,
  coeYears: 10,
  coeMonths: 0,
  fuelEconomyKmPerL: 13.0,
  annualInsurance: 3000,
  annualRoadTax: 700,
  erpCashcardMonthly: 50,
  annualMaintenance: 1200,
}

export const DEFAULT_LIFESTYLE: LifestyleInputs = {
  driveTimeMinutesDaily: 60,
  ptTimeMinutesDaily: 120,
  commuteDistanceKmDaily: 40,
  commuteDaysPerMonth: 21,
  residentialParkingMonthly: 110,
  workplaceParkingMonthly: 200,
  petrolPricePerL: 3.00,
  ptDailyCost: 5,
}

export const DEFAULT_COMPENSATION: CompensationInputs = {
  annualTotalComp: 100000,
  hoursWorkedPerDay: 9,
  costPerMinuteOverride: null,
}

export const DEFAULT_FINANCING: FinancingInputs = {
  cashInvestmentReturnPct: 4.0,
  loanDownPayment: 50000,
  loanInterestRatePct: 2.78,
  loanTenureMonths: 84,
}
