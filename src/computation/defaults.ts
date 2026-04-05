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
}

export const DEFAULT_LIFESTYLE: LifestyleInputs = {
  driveTimeMinutesOneWay: 30,
  ptTimeMinutesOneWay: 60,
  commuteDistanceKm: 20,
  workDaysPerMonth: 21,
  wfhDaysPerMonth: 0,
  weekendMileageKm: 100,
  hdbSeasonParkingMonthly: 110,
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
