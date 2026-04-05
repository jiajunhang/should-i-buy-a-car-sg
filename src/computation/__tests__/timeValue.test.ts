import { describe, it, expect } from 'vitest'
import { computeCostPerMinute, computeCostPerHour, computeTimeValue } from '../timeValue'
import { DEFAULT_LIFESTYLE, DEFAULT_COMPENSATION } from '../defaults'
import type { CompensationInputs } from '@/types/scenario'

describe('computeCostPerMinute', () => {
  it('computes for default scenario', () => {
    // 100000 / 12 / 9 / 60 / 21 = 0.7319...
    const result = computeCostPerMinute(DEFAULT_COMPENSATION)
    expect(result).toBeCloseTo(0.732, 2)
  })

  it('uses override when set', () => {
    const comp: CompensationInputs = { ...DEFAULT_COMPENSATION, costPerMinuteOverride: 2.5 }
    expect(computeCostPerMinute(comp)).toBe(2.5)
  })

  it('scales linearly with salary', () => {
    const double = { ...DEFAULT_COMPENSATION, annualTotalComp: 200000 }
    expect(computeCostPerMinute(double)).toBeCloseTo(computeCostPerMinute(DEFAULT_COMPENSATION) * 2, 4)
  })
})

describe('computeCostPerHour', () => {
  it('is 60x cost per minute', () => {
    expect(computeCostPerHour(DEFAULT_COMPENSATION)).toBeCloseTo(computeCostPerMinute(DEFAULT_COMPENSATION) * 60)
  })
})

describe('computeTimeValue', () => {
  it('car saves time when driving is faster', () => {
    const result = computeTimeValue(DEFAULT_LIFESTYLE, DEFAULT_COMPENSATION)
    // PT 60 min, drive 30 min → savings = (60-30)*2 = 60 min/day
    expect(result.timeSavingsMonthly).toBeGreaterThan(0)
    expect(result.timeSavingsValueMonthly).toBeGreaterThan(0)
  })

  it('negative time savings when driving is slower', () => {
    const slower = { ...DEFAULT_LIFESTYLE, driveTimeMinutesOneWay: 90 }
    const result = computeTimeValue(slower, DEFAULT_COMPENSATION)
    expect(result.timeSavingsMonthly).toBeLessThan(0)
    expect(result.timeSavingsValueMonthly).toBeLessThan(0)
  })

  it('zero time savings when equal', () => {
    const equal = { ...DEFAULT_LIFESTYLE, driveTimeMinutesOneWay: 60 }
    const result = computeTimeValue(equal, DEFAULT_COMPENSATION)
    expect(result.timeSavingsMonthly).toBe(0)
    expect(result.timeSavingsValueMonthly).toBe(0)
  })

  it('WFH reduces time value', () => {
    const base = computeTimeValue(DEFAULT_LIFESTYLE, DEFAULT_COMPENSATION)
    const wfh = computeTimeValue({ ...DEFAULT_LIFESTYLE, wfhDaysPerMonth: 10 }, DEFAULT_COMPENSATION)
    expect(wfh.timeSavingsValueMonthly).toBeLessThan(base.timeSavingsValueMonthly)
  })

  it('higher salary increases time value', () => {
    const base = computeTimeValue(DEFAULT_LIFESTYLE, DEFAULT_COMPENSATION)
    const highSalary = computeTimeValue(DEFAULT_LIFESTYLE, { ...DEFAULT_COMPENSATION, annualTotalComp: 200000 })
    expect(highSalary.timeSavingsValueMonthly).toBeGreaterThan(base.timeSavingsValueMonthly)
  })
})
