import { describe, it, expect } from 'vitest'
import { computeLoanRepaymentMonthly, computeFlatRateInterest, computeFinancingComparison } from '../financing'
import { DEFAULT_CAR, DEFAULT_FINANCING } from '../defaults'
import type { CarInputs, FinancingInputs } from '@/types/scenario'

describe('computeFlatRateInterest', () => {
  it('matches sgCarMart example: 126800 principal, 2.48%, 84 months', () => {
    // 126800 × 2.48% × 7 years = 22,012.48
    const interest = computeFlatRateInterest(126800, 2.48, 84)
    expect(interest).toBeCloseTo(22012.48, 0)
  })

  it('returns zero for zero principal', () => {
    expect(computeFlatRateInterest(0, 2.78, 84)).toBe(0)
  })

  it('returns zero for zero tenure', () => {
    expect(computeFlatRateInterest(100000, 2.78, 0)).toBe(0)
  })

  it('scales linearly with rate', () => {
    const low = computeFlatRateInterest(100000, 2.0, 84)
    const high = computeFlatRateInterest(100000, 4.0, 84)
    expect(high).toBeCloseTo(low * 2)
  })
})

describe('computeLoanRepaymentMonthly', () => {
  it('matches sgCarMart example: 126800 principal, 2.48%, 84 months → ~1772/mo', () => {
    const result = computeLoanRepaymentMonthly(126800, 2.48, 84)
    expect(result).toBeCloseTo(1772, 0)
  })

  it('returns zero for zero principal', () => {
    expect(computeLoanRepaymentMonthly(0, 2.78, 84)).toBe(0)
  })

  it('returns zero for zero tenure', () => {
    expect(computeLoanRepaymentMonthly(100000, 2.78, 0)).toBe(0)
  })

  it('zero interest rate: simple division', () => {
    expect(computeLoanRepaymentMonthly(100000, 0, 100)).toBeCloseTo(1000)
  })

  it('higher rate means higher repayment', () => {
    const low = computeLoanRepaymentMonthly(100000, 2.0, 84)
    const high = computeLoanRepaymentMonthly(100000, 5.0, 84)
    expect(high).toBeGreaterThan(low)
  })

  it('total repayment exceeds principal (interest)', () => {
    const monthly = computeLoanRepaymentMonthly(100000, 2.78, 84)
    const total = monthly * 84
    expect(total).toBeGreaterThan(100000)
  })
})

describe('computeFinancingComparison', () => {
  const car: CarInputs = { ...DEFAULT_CAR }
  const fin: FinancingInputs = { ...DEFAULT_FINANCING }

  it('loan advantage when investment return greatly exceeds flat rate', () => {
    // Flat rate 1% → ~2% EIR, vs 10% investment return — loan clearly wins
    const highReturn = { ...fin, cashInvestmentReturnPct: 10.0, loanInterestRatePct: 1.0 }
    const result = computeFinancingComparison(car, highReturn)
    expect(result.financingAdvantage).toBe('loan')
    expect(result.monthlySavings).toBeGreaterThan(0)
  })

  it('cash advantage when investment return < loan rate', () => {
    const lowReturn = { ...fin, cashInvestmentReturnPct: 1.0, loanInterestRatePct: 5.0 }
    const result = computeFinancingComparison(car, lowReturn)
    expect(result.financingAdvantage).toBe('cash')
  })

  it('neutral when both costs are within threshold', () => {
    const similar = { ...fin, cashInvestmentReturnPct: 0, loanInterestRatePct: 0, loanDownPayment: car.purchasePrice }
    const result = computeFinancingComparison(car, similar)
    expect(result.financingAdvantage).toBe('neutral')
  })

  it('cashUpfront equals purchase price', () => {
    const result = computeFinancingComparison(car, fin)
    expect(result.cashUpfront).toBe(car.purchasePrice)
  })

  it('loanUpfront equals down payment', () => {
    const result = computeFinancingComparison(car, fin)
    expect(result.loanUpfront).toBe(fin.loanDownPayment)
  })

  it('loan total interest is non-negative', () => {
    const result = computeFinancingComparison(car, fin)
    expect(result.loanTotalInterest).toBeGreaterThanOrEqual(0)
  })

  it('full cash down payment means zero loan repayment', () => {
    const fullCash = { ...fin, loanDownPayment: car.purchasePrice }
    const result = computeFinancingComparison(car, fullCash)
    expect(result.loanMonthlyRepayment).toBe(0)
    expect(result.loanTotalInterest).toBe(0)
  })

  it('matches sgCarMart for real-world example', () => {
    const testCar: CarInputs = { ...car, purchasePrice: 206800 }
    const testFin: FinancingInputs = {
      cashInvestmentReturnPct: 4.0,
      loanDownPayment: 80000,
      loanInterestRatePct: 2.48,
      loanTenureMonths: 84,
    }
    const result = computeFinancingComparison(testCar, testFin)
    expect(result.loanMonthlyRepayment).toBeCloseTo(1772, 0)
    expect(result.loanTotalInterest).toBeCloseTo(22012, 0)
  })
})
