import type { CarInputs, LifestyleInputs, CompensationInputs, FinancingInputs } from '@/types/scenario'

export const DEFAULT_CAR: CarInputs = {
  name: '',
  purchasePrice: 150000,
  annualDepreciation: 15000,
  scrapValue: 0,          // auto-computed: 150000 - 15000 * (120/12) = 0
  coeMonthsRemaining: 120, // 10 years
  fuelEconomyKmPerL: 13.0,
  annualInsurance: 3000,
  annualRoadTax: 742,
}

export const DEFAULT_LIFESTYLE: LifestyleInputs = {
  driveTimeMinutesOneWay: 30,
  ptTimeMinutesOneWay: 60,
  commuteDistanceKm: 20,
  workDaysPerMonth: 21,
  wfhDaysPerMonth: 0,
  weekendMileageKm: 100,
  hdbSeasonParkingMonthly: 110,
  workplaceParkingMonthly: 196,
  petrolPricePerL: 3.40,
  mrtDailyCost: 4.30,
  grabCostPerTrip: 25,
  ptMode: 'mrt',
  grabTripsPerMonth: 4,
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
  loanTenureMonths: 84,  // will be auto-computed from COE months
}
