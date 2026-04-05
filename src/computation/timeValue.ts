import type { LifestyleInputs, CompensationInputs, TimeValueResult } from '@/types/scenario'

export function computeCostPerMinute(compensation: CompensationInputs): number {
  if (compensation.costPerMinuteOverride !== null) {
    return compensation.costPerMinuteOverride
  }
  return compensation.annualTotalComp / 12 / compensation.hoursWorkedPerDay / 60 / 21
}

export function computeCostPerHour(compensation: CompensationInputs): number {
  return computeCostPerMinute(compensation) * 60
}

export function computeTimeValue(
  lifestyle: LifestyleInputs,
  compensation: CompensationInputs
): TimeValueResult {
  const costPerMinute = computeCostPerMinute(compensation)
  const costPerHour = costPerMinute * 60
  const commuteDays = lifestyle.commuteDaysPerMonth

  const carDailyMinutes = lifestyle.driveTimeMinutesDaily
  const ptDailyMinutes = lifestyle.ptTimeMinutesDaily

  const carCommuteTimeCostMonthly = carDailyMinutes * commuteDays * costPerMinute
  const ptCommuteTimeCostMonthly = ptDailyMinutes * commuteDays * costPerMinute

  const timeSavingsMinutesDaily = ptDailyMinutes - carDailyMinutes
  const timeSavingsMonthly = timeSavingsMinutesDaily * commuteDays
  const timeSavingsValueMonthly = timeSavingsMonthly * costPerMinute

  return {
    costPerMinute,
    costPerHour,
    carCommuteTimeCostMonthly,
    ptCommuteTimeCostMonthly,
    timeSavingsMonthly,
    timeSavingsValueMonthly,
  }
}
