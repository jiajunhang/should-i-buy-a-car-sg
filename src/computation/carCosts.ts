import type { CarInputs, LifestyleInputs, FinancingInputs, CarCostBreakdown } from '@/types/scenario'

export function computeDepreciationMonthly(car: CarInputs): number {
  const annualDep = (car.purchasePrice - car.scrapValue) / car.coeTenureYears
  return annualDep / 12
}

export function computeFuelMonthly(car: CarInputs, lifestyle: LifestyleInputs): number {
  const commuteDays = lifestyle.workDaysPerMonth - lifestyle.wfhDaysPerMonth
  const commuteKmMonthly = lifestyle.commuteDistanceKm * 2 * commuteDays
  const totalKmMonthly = commuteKmMonthly + lifestyle.weekendMileageKm
  const litresMonthly = totalKmMonthly / car.fuelEconomyKmPerL
  return litresMonthly * lifestyle.petrolPricePerL
}

export function computeParkingMonthly(lifestyle: LifestyleInputs): number {
  return lifestyle.hdbSeasonParkingMonthly + lifestyle.workplaceParkingMonthly
}

export function computeFinancingCostMonthly(car: CarInputs, financing: FinancingInputs): number {
  if (financing.mode === 'loan') {
    return computeLoanInterestMonthly(car, financing)
  }
  // Cash: opportunity cost of capital tied up
  const avgCapitalTiedUp = (car.purchasePrice + car.scrapValue) / 2
  const annualReturn = avgCapitalTiedUp * (financing.investmentReturnRatePct / 100)
  return annualReturn / 12
}

function computeLoanInterestMonthly(car: CarInputs, financing: FinancingInputs): number {
  const principal = car.purchasePrice - financing.downPayment
  if (principal <= 0) return 0
  const monthlyRate = financing.loanInterestRatePct / 100 / 12
  const totalPayments = financing.loanTenureYears * 12
  if (monthlyRate === 0) return 0
  // Standard amortisation formula
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1)
  // Total interest over tenure, amortised monthly
  const totalInterest = (monthlyPayment * totalPayments) - principal
  return totalInterest / totalPayments
}

export function computeLoanRepaymentMonthly(car: CarInputs, financing: FinancingInputs): number {
  if (financing.mode !== 'loan') return 0
  const principal = car.purchasePrice - financing.downPayment
  if (principal <= 0) return 0
  const monthlyRate = financing.loanInterestRatePct / 100 / 12
  const totalPayments = financing.loanTenureYears * 12
  if (monthlyRate === 0) return principal / totalPayments
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1)
}

export function computeCarCosts(
  car: CarInputs,
  lifestyle: LifestyleInputs,
  financing: FinancingInputs
): CarCostBreakdown {
  const depreciationMonthly = computeDepreciationMonthly(car)
  const roadTaxMonthly = car.annualRoadTax / 12
  const insuranceMonthly = car.annualInsurance / 12
  const parkingMonthly = computeParkingMonthly(lifestyle)
  const fuelMonthly = computeFuelMonthly(car, lifestyle)
  const financingCostMonthly = computeFinancingCostMonthly(car, financing)

  return {
    depreciationMonthly,
    roadTaxMonthly,
    insuranceMonthly,
    parkingMonthly,
    fuelMonthly,
    financingCostMonthly,
    totalMonthly: depreciationMonthly + roadTaxMonthly + insuranceMonthly +
      parkingMonthly + fuelMonthly + financingCostMonthly,
  }
}
