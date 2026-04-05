import type { LifestyleInputs, PTCostBreakdown } from '@/types/scenario'

export function computePTCosts(lifestyle: LifestyleInputs): PTCostBreakdown {
  const ptMonthly = lifestyle.ptDailyCost * lifestyle.commuteDaysPerMonth

  return {
    ptMonthly,
    totalMonthly: ptMonthly,
  }
}
