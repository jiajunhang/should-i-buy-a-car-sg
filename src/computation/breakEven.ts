import type { LifestyleInputs } from '@/types/scenario'

/**
 * Solve for the annual salary at which:
 *   carCostMonthly + carTimeCost = ptCostMonthly + ptTimeCost
 *
 * Time cost = commuteMinutes × commuteDays × costPerMinute
 * costPerMinute = salary / (12 × 21 × 9 × 60)
 *
 * Let K = 1 / (12 × 21 × 9 × 60) = salary-to-minute-cost conversion factor
 * Let D = commuteDays per month
 * Let Tc = car round-trip minutes, Tp = PT round-trip minutes
 *
 * Equation:
 *   carCost + salary × K × Tc × D = ptCost + salary × K × Tp × D
 *   carCost - ptCost = salary × K × D × (Tp - Tc)
 *   salary = (carCost - ptCost) / (K × D × (Tp - Tc))
 *
 * Returns null if:
 * - Car is faster AND cheaper (always sensible)
 * - Car is slower AND more expensive (never sensible via time value)
 * - No time difference (division by zero)
 */
export function computeBreakEvenSalary(
  carCostMonthly: number,
  ptCostMonthly: number,
  lifestyle: LifestyleInputs
): number | null {
  const commuteDays = lifestyle.workDaysPerMonth - lifestyle.wfhDaysPerMonth
  const carRoundTripMin = lifestyle.driveTimeMinutesOneWay * 2
  const ptRoundTripMin = lifestyle.ptTimeMinutesOneWay * 2
  const timeDiffMin = ptRoundTripMin - carRoundTripMin // positive = car saves time

  const costGap = carCostMonthly - ptCostMonthly // positive = car costs more

  // If car is cheaper, no break-even needed
  if (costGap <= 0) return null

  // If car doesn't save time, time value can never close the gap
  if (timeDiffMin <= 0) return null

  const K = 1 / (12 * 21 * 9 * 60)
  const salary = costGap / (K * commuteDays * timeDiffMin)

  // Sanity check: if break-even salary is unreasonably high (>$2M), treat as impractical
  if (salary > 2_000_000) return null

  return salary
}
