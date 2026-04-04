import type { CarInputs, LifestyleInputs, CompensationInputs, FinancingInputs } from '@/types/scenario'

export const DEFAULT_CAR: CarInputs = {
  name: '',
  purchasePrice: 150000,
  scrapValue: 0,
  coeTenureYears: 10,
  engineCC: 1600,
  fuelEconomyKmPerL: 13.0,
  annualInsurance: 3000,
  annualRoadTax: 742,
}

export const DEFAULT_LIFESTYLE: LifestyleInputs = {
  commuteMode: 'manual',
  driveTimeMinutesOneWay: 30,
  ptTimeMinutesOneWay: 60,
  commuteDistanceKm: 20,
  homePostalCode: '',
  workPostalCode: '',
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
  costPerMinuteOverride: null,
}

export const DEFAULT_FINANCING: FinancingInputs = {
  mode: 'cash',
  downPayment: 50000,
  loanInterestRatePct: 2.78,
  loanTenureYears: 7,
  investmentReturnRatePct: 4.0,
}

// Road tax lookup by engine CC (Singapore LTA rates for petrol cars)
export function estimateRoadTax(engineCC: number): number {
  if (engineCC <= 600) return 200 * 0.782
  if (engineCC <= 1000) return (200 * 0.782) + ((engineCC - 600) * 0.25 * 0.782)
  if (engineCC <= 1600) return (200 * 0.782 + 100 * 0.782) + ((engineCC - 1000) * 0.75 * 0.782)
  if (engineCC <= 3000) return (200 * 0.782 + 100 * 0.782 + 450 * 0.782) + ((engineCC - 1600) * 1.50 * 0.782)
  return (200 * 0.782 + 100 * 0.782 + 450 * 0.782 + 2100 * 0.782) + ((engineCC - 3000) * 2.00 * 0.782)
}
