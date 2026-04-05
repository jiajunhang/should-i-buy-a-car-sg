import { describe, it, expect } from 'vitest'
import { computeCarCosts, computeDepreciationMonthly, computeCommuteFuelMonthly, computeParkingMonthly, computeScrapValue, computeCoeMonths } from '../carCosts'
import { DEFAULT_CAR, DEFAULT_LIFESTYLE } from '../defaults'
import type { CarInputs, LifestyleInputs } from '@/types/scenario'

const car: CarInputs = { ...DEFAULT_CAR }
const lifestyle: LifestyleInputs = { ...DEFAULT_LIFESTYLE }

describe('computeDepreciationMonthly', () => {
  it('divides annual depreciation by 12', () => {
    expect(computeDepreciationMonthly(car)).toBeCloseTo(15000 / 12)
  })

  it('handles zero depreciation', () => {
    expect(computeDepreciationMonthly({ ...car, annualDepreciation: 0 })).toBe(0)
  })
})

describe('computeScrapValue', () => {
  it('computes correctly for default 10-year COE', () => {
    // 150000 - 15000 * 10 = 0
    expect(computeScrapValue(car)).toBe(0)
  })

  it('returns positive scrap value for shorter tenure', () => {
    const shortCoe = { ...car, coeYears: 5, coeMonths: 0 }
    // 150000 - 15000 * 5 = 75000
    expect(computeScrapValue(shortCoe)).toBe(75000)
  })

  it('never returns negative', () => {
    const longDepreciation = { ...car, annualDepreciation: 50000 }
    expect(computeScrapValue(longDepreciation)).toBe(0)
  })
})

describe('computeCoeMonths', () => {
  it('converts years and months to total months', () => {
    expect(computeCoeMonths(car)).toBe(120)
  })

  it('handles mixed years and months', () => {
    expect(computeCoeMonths({ ...car, coeYears: 6, coeMonths: 3 })).toBe(75)
  })
})

describe('computeCommuteFuelMonthly', () => {
  it('computes fuel for default scenario', () => {
    // commuteKm = 40 * 21 = 840
    // litres = 840 / 13 = 64.615...
    // cost = 64.615 * 3.00 = 193.85
    const result = computeCommuteFuelMonthly(car, lifestyle)
    expect(result).toBeCloseTo(193.85, 1)
  })

  it('reduces with fewer commute days', () => {
    const fewer = { ...lifestyle, commuteDaysPerMonth: 11 }
    const base = computeCommuteFuelMonthly(car, lifestyle)
    const reduced = computeCommuteFuelMonthly(car, fewer)
    expect(reduced).toBeLessThan(base)
    expect(reduced).toBeCloseTo(base * 11 / 21, 1)
  })

  it('returns zero when zero commute days', () => {
    const noDays = { ...lifestyle, commuteDaysPerMonth: 0 }
    expect(computeCommuteFuelMonthly(car, noDays)).toBe(0)
  })
})

describe('computeParkingMonthly', () => {
  it('sums residential and workplace parking', () => {
    expect(computeParkingMonthly(lifestyle)).toBe(110 + 200)
  })
})

describe('computeCarCosts', () => {
  it('totalMonthly sums all components', () => {
    const result = computeCarCosts(car, lifestyle)
    const expected = result.depreciationMonthly + result.roadTaxMonthly +
      result.insuranceMonthly + result.parkingMonthly + result.fuelCommuteMonthly +
      result.erpCashcardMonthly + result.maintenanceMonthly
    expect(result.totalMonthly).toBeCloseTo(expected)
  })

  it('all cost components are non-negative', () => {
    const result = computeCarCosts(car, lifestyle)
    expect(result.depreciationMonthly).toBeGreaterThanOrEqual(0)
    expect(result.roadTaxMonthly).toBeGreaterThanOrEqual(0)
    expect(result.insuranceMonthly).toBeGreaterThanOrEqual(0)
    expect(result.parkingMonthly).toBeGreaterThanOrEqual(0)
    expect(result.fuelCommuteMonthly).toBeGreaterThanOrEqual(0)
    expect(result.erpCashcardMonthly).toBeGreaterThanOrEqual(0)
    expect(result.maintenanceMonthly).toBeGreaterThanOrEqual(0)
  })

  it('includes ERP and maintenance in total', () => {
    const result = computeCarCosts(car, lifestyle)
    const withoutExtras = result.depreciationMonthly + result.roadTaxMonthly +
      result.insuranceMonthly + result.parkingMonthly + result.fuelCommuteMonthly
    expect(result.totalMonthly).toBeGreaterThan(withoutExtras)
    // ERP: 50, Maintenance: 1200/12 = 100
    expect(result.totalMonthly - withoutExtras).toBeCloseTo(50 + 100)
  })
})
