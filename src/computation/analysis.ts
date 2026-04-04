import type { Scenario, AnalysisResult } from '@/types/scenario'
import { computeCarCosts } from './carCosts'
import { computePTCosts } from './ptCosts'
import { computeTimeValue } from './timeValue'
import { computeBreakEvenSalary } from './breakEven'

export function analyseScenario(scenario: Scenario): AnalysisResult {
  const carCosts = computeCarCosts(scenario.car, scenario.lifestyle, scenario.financing)
  const ptCosts = computePTCosts(scenario.lifestyle)
  const timeValue = computeTimeValue(scenario.lifestyle, scenario.compensation)

  // Negative = car costs more than PT
  const netGapWithoutTime = ptCosts.totalMonthly - carCosts.totalMonthly
  const netGapWithTime = netGapWithoutTime + timeValue.timeSavingsValueMonthly

  const breakEvenSalary = computeBreakEvenSalary(
    carCosts.totalMonthly,
    ptCosts.totalMonthly,
    scenario.lifestyle
  )

  let verdict: AnalysisResult['verdict']
  if (netGapWithTime >= 0) {
    verdict = 'sensible'
  } else if (netGapWithTime >= -500) {
    verdict = 'borderline'
  } else {
    verdict = 'hard-to-justify'
  }

  return {
    carCosts,
    ptCosts,
    timeValue,
    netGapWithoutTime,
    netGapWithTime,
    breakEvenSalary,
    verdict,
  }
}
