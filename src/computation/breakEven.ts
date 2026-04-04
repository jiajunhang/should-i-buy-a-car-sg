import type { LifestyleInputs, CompensationInputs } from '@/types/scenario'

/**
 * Solve for the annual salary at which:
 *   carCostMonthly + carTimeCost = ptCostMonthly + ptTimeCost
 *
 * Time cost = commuteMinutes × commuteDays × costPerMinute
 * costPerMinute = salary / (12 × hoursPerDay × 60 × workDays)
 *
 * Let K = 1 / (12 × hoursPerDay × 60 × workDays)
 * Let D = commuteDays per month
 * Let Tc = car round-trip minutes, Tp = PT round-trip minutes
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
  const commuteDays = lifestyle.workDaysPerMonth - lifestyle.wfhDaysPerMonth
  const carRoundTripMin = lifestyle.driveTimeMinutesOneWay * 2
  const ptRoundTripMin = lifestyle.ptTimeMinutesOneWay * 2
  const timeDiffMin = ptRoundTripMin - carRoundTripMin

  const costGap = carCostMonthly - ptCostMonthly

  if (costGap <= 0) return null   // Car is already cheaper
  if (timeDiffMin <= 0) return null // Car doesn't save time

  const K = 1 / (12 * compensation.hoursWorkedPerDay * 60 * lifestyle.workDaysPerMonth)
  const salary = costGap / (K * commuteDays * timeDiffMin)

  if (salary > 2_000_000) return null
  return salary
}
