import { describe, it, expect } from 'vitest'
import { computeBreakEvenSalary } from '../breakEven'
import { DEFAULT_LIFESTYLE, DEFAULT_COMPENSATION } from '../defaults'

describe('computeBreakEvenSalary', () => {
  it('returns a salary when car costs more but saves time', () => {
    // Car: $2000/mo, PT: $105/mo, car saves 60min/day (default)
    const result = computeBreakEvenSalary(2000, 105, DEFAULT_LIFESTYLE, DEFAULT_COMPENSATION)
    expect(result).not.toBeNull()
    expect(result).toBeGreaterThan(0)
  })

  it('returns null when car is already cheaper', () => {
    // Car: $50/mo, PT: $105/mo → car is cheaper, no break-even needed
    const result = computeBreakEvenSalary(50, 105, DEFAULT_LIFESTYLE, DEFAULT_COMPENSATION)
    expect(result).toBeNull()
  })

  it('returns null when car does not save time', () => {
    const noTimeSavings = { ...DEFAULT_LIFESTYLE, driveTimeMinutesDaily: 120, ptTimeMinutesDaily: 120 }
    const result = computeBreakEvenSalary(2000, 105, noTimeSavings, DEFAULT_COMPENSATION)
    expect(result).toBeNull()
  })

  it('returns null when driving is slower', () => {
    const slower = { ...DEFAULT_LIFESTYLE, driveTimeMinutesDaily: 180 }
    const result = computeBreakEvenSalary(2000, 105, slower, DEFAULT_COMPENSATION)
    expect(result).toBeNull()
  })

  it('higher cost gap requires higher salary', () => {
    const low = computeBreakEvenSalary(500, 105, DEFAULT_LIFESTYLE, DEFAULT_COMPENSATION)
    const high = computeBreakEvenSalary(2000, 105, DEFAULT_LIFESTYLE, DEFAULT_COMPENSATION)
    expect(low).not.toBeNull()
    expect(high).not.toBeNull()
    expect(high!).toBeGreaterThan(low!)
  })

  it('more time savings lowers break-even salary', () => {
    const bigTimeSave = { ...DEFAULT_LIFESTYLE, driveTimeMinutesDaily: 20, ptTimeMinutesDaily: 180 }
    const smallTimeSave = { ...DEFAULT_LIFESTYLE, driveTimeMinutesDaily: 100, ptTimeMinutesDaily: 120 }
    const low = computeBreakEvenSalary(2000, 105, bigTimeSave, DEFAULT_COMPENSATION)
    const high = computeBreakEvenSalary(2000, 105, smallTimeSave, DEFAULT_COMPENSATION)
    expect(low).not.toBeNull()
    expect(high).not.toBeNull()
    expect(low!).toBeLessThan(high!)
  })
})
