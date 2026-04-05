import type { Scenario, AnalysisResult } from '@/types/scenario'
import { computeCarCosts } from './carCosts'
import { computePTCosts } from './ptCosts'
import { computeTimeValue } from './timeValue'
import { computeBreakEvenSalary } from './breakEven'
import { computeFinancingComparison } from './financing'

export function analyseScenario(scenario: Scenario): AnalysisResult {
  const carCosts = computeCarCosts(scenario.car, scenario.lifestyle)
  const ptCosts = computePTCosts(scenario.lifestyle)
  const timeValue = computeTimeValue(scenario.lifestyle, scenario.compensation)
  const financing = computeFinancingComparison(scenario.car, scenario.financing)

  // Use commute-only car cost for the inequality comparison
  const netGapWithoutTime = ptCosts.totalMonthly - carCosts.totalMonthly
  const netGapWithTime = netGapWithoutTime + timeValue.timeSavingsValueMonthly

  const breakEvenSalary = computeBreakEvenSalary(
    carCosts.totalMonthly,
    ptCosts.totalMonthly,
    scenario.lifestyle,
    scenario.compensation,
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
    financing,
    netGapWithoutTime,
    netGapWithTime,
    breakEvenSalary,
    verdict,
  }
}
