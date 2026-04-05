import type { LifestyleInputs, PTCostBreakdown } from '@/types/scenario'

export function computePTCosts(lifestyle: LifestyleInputs): PTCostBreakdown {
  const commuteDays = lifestyle.workDaysPerMonth - lifestyle.wfhDaysPerMonth
  const ptMonthly = lifestyle.ptDailyCost * commuteDays

  return {
    ptMonthly,
    totalMonthly: ptMonthly,
  }
}
