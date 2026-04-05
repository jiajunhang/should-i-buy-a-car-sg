import { describe, it, expect } from 'vitest'
import { analyseScenario } from '../analysis'
import { DEFAULT_CAR, DEFAULT_LIFESTYLE, DEFAULT_COMPENSATION, DEFAULT_FINANCING } from '../defaults'
import type { Scenario } from '@/types/scenario'

function makeScenario(overrides?: Partial<Scenario>): Scenario {
  return {
    id: 'test',
    name: 'Test',
    car: { ...DEFAULT_CAR },
    lifestyle: { ...DEFAULT_LIFESTYLE },
    compensation: { ...DEFAULT_COMPENSATION },
    financing: { ...DEFAULT_FINANCING },
    wizardStep: 'complete',
    createdAt: 0,
    ...overrides,
  }
}

describe('analyseScenario', () => {
  it('returns all required fields', () => {
    const result = analyseScenario(makeScenario())
    expect(result.carCosts).toBeDefined()
    expect(result.ptCosts).toBeDefined()
    expect(result.timeValue).toBeDefined()
    expect(result.financing).toBeDefined()
    expect(result.netGapWithoutTime).toBeDefined()
    expect(result.netGapWithTime).toBeDefined()
    expect(result.verdict).toBeDefined()
  })

  it('netGapWithTime includes time savings', () => {
    const result = analyseScenario(makeScenario())
    expect(result.netGapWithTime).not.toEqual(result.netGapWithoutTime)
    // With default 30 min drive vs 60 min PT, time savings should help
    expect(result.netGapWithTime).toBeGreaterThan(result.netGapWithoutTime)
  })

  it('verdict is hard-to-justify with very low salary', () => {
    const result = analyseScenario(makeScenario({
      compensation: { ...DEFAULT_COMPENSATION, annualTotalComp: 30000 },
    }))
    expect(result.verdict).toBe('hard-to-justify')
  })

  it('verdict is sensible with very high salary', () => {
    const result = analyseScenario(makeScenario({
      compensation: { ...DEFAULT_COMPENSATION, annualTotalComp: 500000 },
    }))
    expect(result.verdict).toBe('sensible')
  })

  it('netGapWithoutTime is PT cost minus car total cost', () => {
    const result = analyseScenario(makeScenario())
    expect(result.netGapWithoutTime).toBeCloseTo(
      result.ptCosts.totalMonthly - result.carCosts.totalMonthly
    )
  })

  it('fewer commute days reduces time value advantage', () => {
    const base = analyseScenario(makeScenario())
    const fewer = analyseScenario(makeScenario({
      lifestyle: { ...DEFAULT_LIFESTYLE, commuteDaysPerMonth: 10 },
    }))
    expect(fewer.timeValue.timeSavingsValueMonthly).toBeLessThan(base.timeValue.timeSavingsValueMonthly)
  })
})
