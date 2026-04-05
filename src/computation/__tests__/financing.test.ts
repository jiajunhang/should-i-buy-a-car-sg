import { describe, it, expect } from 'vitest'
import { computeLoanRepaymentMonthly, computeFinancingComparison } from '../financing'
import { DEFAULT_CAR, DEFAULT_FINANCING } from '../defaults'
import type { CarInputs, FinancingInputs } from '@/types/scenario'

describe('computeLoanRepaymentMonthly', () => {
  it('computes standard amortisation', () => {
    // 100k loan, 2.78% p.a., 84 months
    const result = computeLoanRepaymentMonthly(100000, 2.78, 84)
    // Should be roughly $1,300-1,400/mo
    expect(result).toBeGreaterThan(1200)
    expect(result).toBeLessThan(1500)
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

  it('loan advantage when investment return > loan rate', () => {
    const highReturn = { ...fin, cashInvestmentReturnPct: 7.0, loanInterestRatePct: 2.78 }
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
    // With full cash down payment and zero interest, both effective costs are just opportunity cost
    const similar = { ...fin, cashInvestmentReturnPct: 0, loanInterestRatePct: 0, loanDownPayment: car.purchasePrice }
    const result = computeFinancingComparison(car, similar)
    // Both opportunity costs are zero, so diff < 5 → neutral
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
})
