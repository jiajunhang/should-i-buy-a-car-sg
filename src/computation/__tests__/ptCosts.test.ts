import { describe, it, expect } from 'vitest'
import { computePTCosts } from '../ptCosts'
import { DEFAULT_LIFESTYLE } from '../defaults'

describe('computePTCosts', () => {
  it('computes for default scenario', () => {
    const result = computePTCosts(DEFAULT_LIFESTYLE)
    // commuteDays = 21 - 0 = 21, ptMonthly = 5 * 21 = 105
    expect(result.ptMonthly).toBeCloseTo(105)
    expect(result.totalMonthly).toBeCloseTo(105)
  })

  it('reduces with WFH days', () => {
    const wfh = { ...DEFAULT_LIFESTYLE, wfhDaysPerMonth: 10 }
    const result = computePTCosts(wfh)
    // commuteDays = 21 - 10 = 11, ptMonthly = 5 * 11 = 55
    expect(result.ptMonthly).toBeCloseTo(55)
  })

  it('returns zero when fully WFH', () => {
    const fullWfh = { ...DEFAULT_LIFESTYLE, wfhDaysPerMonth: 21 }
    const result = computePTCosts(fullWfh)
    expect(result.totalMonthly).toBe(0)
  })

  it('scales with daily cost', () => {
    const expensive = { ...DEFAULT_LIFESTYLE, ptDailyCost: 10 }
    const result = computePTCosts(expensive)
    expect(result.ptMonthly).toBeCloseTo(210)
  })
})
