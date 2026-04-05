import type { LifestyleInputs, CompensationInputs } from '@/types/scenario'

/**
 * Solve for the annual salary at which:
 *   carCostMonthly + carTimeCost = ptCostMonthly + ptTimeCost
 *
 * Time cost = dailyMinutes × commuteDays × costPerMinute
 * costPerMinute = salary / (12 × hoursPerDay × 60 × 21)
 *
 * Let K = 1 / (12 × hoursPerDay × 60 × 21)
 * Let D = commuteDays per month
 * Let Tc = car daily minutes, Tp = PT daily minutes
 *
 * salary = (carCost - ptCost) / (K × D × (Tp - Tc))
 *
 * Returns null if no break-even exists.
 */
export function computeBreakEvenSalary(
  carCostMonthly: number,
  ptCostMonthly: number,
  lifestyle: LifestyleInputs,
  compensation: CompensationInputs,
): number | null {
  const commuteDays = lifestyle.commuteDaysPerMonth
  const carDailyMin = lifestyle.driveTimeMinutesDaily
  const ptDailyMin = lifestyle.ptTimeMinutesDaily
  const timeDiffMin = ptDailyMin - carDailyMin

  const costGap = carCostMonthly - ptCostMonthly

  if (costGap <= 0) return null   // Car is already cheaper
  if (timeDiffMin <= 0) return null // Car doesn't save time

  // K uses 21 (standard work days) to match costPerMinute formula
  const K = 1 / (12 * compensation.hoursWorkedPerDay * 60 * 21)
  const salary = costGap / (K * commuteDays * timeDiffMin)

  if (salary > 2_000_000) return null
  return salary
}
