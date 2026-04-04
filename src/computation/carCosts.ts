import type { CarInputs, LifestyleInputs, CarCostBreakdown } from '@/types/scenario'

export function computeDepreciationMonthly(car: CarInputs): number {
  return car.annualDepreciation / 12
}

export function computeScrapValue(car: CarInputs): number {
  const tenureYears = car.coeMonthsRemaining / 12
  return car.purchasePrice - (car.annualDepreciation * tenureYears)
}

export function computeAnnualDepreciation(car: CarInputs): number {
  const tenureYears = car.coeMonthsRemaining / 12
  if (tenureYears <= 0) return 0
  return (car.purchasePrice - car.scrapValue) / tenureYears
}

export function computeCommuteFuelMonthly(car: CarInputs, lifestyle: LifestyleInputs): number {
  const commuteDays = lifestyle.workDaysPerMonth - lifestyle.wfhDaysPerMonth
  const commuteKmMonthly = lifestyle.commuteDistanceKm * 2 * commuteDays
  const litresMonthly = commuteKmMonthly / car.fuelEconomyKmPerL
  return litresMonthly * lifestyle.petrolPricePerL
}

export function computeWeekendFuelMonthly(car: CarInputs, lifestyle: LifestyleInputs): number {
  const litresMonthly = lifestyle.weekendMileageKm / car.fuelEconomyKmPerL
  return litresMonthly * lifestyle.petrolPricePerL
}

export function computeParkingMonthly(lifestyle: LifestyleInputs): number {
  return lifestyle.hdbSeasonParkingMonthly + lifestyle.workplaceParkingMonthly
}

export function computeCarCosts(
  car: CarInputs,
  lifestyle: LifestyleInputs,
): CarCostBreakdown {
  const depreciationMonthly = computeDepreciationMonthly(car)
  const roadTaxMonthly = car.annualRoadTax / 12
  const insuranceMonthly = car.annualInsurance / 12
  const parkingMonthly = computeParkingMonthly(lifestyle)
  const fuelCommuteMonthly = computeCommuteFuelMonthly(car, lifestyle)
  const fuelWeekendMonthly = computeWeekendFuelMonthly(car, lifestyle)

  const totalCommuteMonthly = depreciationMonthly + roadTaxMonthly + insuranceMonthly +
    parkingMonthly + fuelCommuteMonthly
  const totalOwnershipMonthly = totalCommuteMonthly + fuelWeekendMonthly

  return {
    depreciationMonthly,
    roadTaxMonthly,
    insuranceMonthly,
    parkingMonthly,
    fuelCommuteMonthly,
    fuelWeekendMonthly,
    totalCommuteMonthly,
    totalOwnershipMonthly,
  }
}
