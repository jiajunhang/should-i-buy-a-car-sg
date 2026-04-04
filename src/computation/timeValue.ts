import type { LifestyleInputs, CompensationInputs, TimeValueResult } from '@/types/scenario'

export function computeCostPerMinute(compensation: CompensationInputs): number {
  if (compensation.costPerMinuteOverride !== null) {
    return compensation.costPerMinuteOverride
  }
  // Annual comp / 12 months / 21 work days / 9 hours / 60 minutes
  return compensation.annualTotalComp / 12 / 21 / 9 / 60
}

export function computeTimeValue(
  lifestyle: LifestyleInputs,
  compensation: CompensationInputs
): TimeValueResult {
  const costPerMinute = computeCostPerMinute(compensation)
  const commuteDays = lifestyle.workDaysPerMonth - lifestyle.wfhDaysPerMonth

  // Daily round-trip times
  const carDailyMinutes = lifestyle.driveTimeMinutesOneWay * 2
  const ptDailyMinutes = lifestyle.ptTimeMinutesOneWay * 2

  const carCommuteTimeCostMonthly = carDailyMinutes * commuteDays * costPerMinute
  const ptCommuteTimeCostMonthly = ptDailyMinutes * commuteDays * costPerMinute

  const timeSavingsMinutesDaily = ptDailyMinutes - carDailyMinutes // positive = car is faster
  const timeSavingsMonthly = timeSavingsMinutesDaily * commuteDays
  const timeSavingsValueMonthly = timeSavingsMonthly * costPerMinute

  return {
    costPerMinute,
    carCommuteTimeCostMonthly,
    ptCommuteTimeCostMonthly,
    timeSavingsMonthly,
    timeSavingsValueMonthly,
  }
}
