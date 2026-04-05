import type { CarInputs, FinancingInputs, FinancingComparison } from '@/types/scenario'
import { getScrapValue } from '@/types/scenario'

/**
 * Compute monthly loan repayment using Singapore flat-rate interest.
 *
 * Singapore car loans use flat-rate interest: interest is calculated on the
 * original principal for the full term, regardless of how much has been repaid.
 *
 *   Total interest = principal × flatRate × years
 *   Monthly repayment = (principal + totalInterest) / tenureMonths
 *
 * This means the effective interest rate (EIR) is roughly double the flat rate,
 * since you're paying interest on the full principal even as it reduces.
 */
export function computeFlatRateInterest(principal: number, annualFlatRatePct: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0
  const years = tenureMonths / 12
  return principal * (annualFlatRatePct / 100) * years
}

export function computeLoanRepaymentMonthly(principal: number, annualFlatRatePct: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0
  const totalInterest = computeFlatRateInterest(principal, annualFlatRatePct, tenureMonths)
  return (principal + totalInterest) / tenureMonths
}

/**
 * Compare cash vs loan financing for the same car.
 *
 * Cash scenario: you pay full price upfront. Opportunity cost = returns you
 * forgo on that capital (averaged over the car's life as it depreciates).
 *
 * Loan scenario: you pay a down payment upfront + monthly repayments.
 * Costs = loan interest + opportunity cost on down payment.
 *
 * The key insight: when loan rate < investment return rate, borrowing is cheaper
 * because your capital earns more than the interest costs.
 */
export function computeFinancingComparison(
  car: CarInputs,
  financing: FinancingInputs,
): FinancingComparison {
  // Cash scenario
  const cashUpfront = car.purchasePrice
  // Average capital tied up over car's life (depreciates from purchase to scrap)
  const avgCashCapital = (car.purchasePrice + getScrapValue(car)) / 2
  const cashOpportunityCostMonthly = avgCashCapital * (financing.cashInvestmentReturnPct / 100) / 12

  // Loan scenario
  const loanUpfront = financing.loanDownPayment
  const loanPrincipal = Math.max(0, car.purchasePrice - financing.loanDownPayment)
  const loanTotalInterest = computeFlatRateInterest(
    loanPrincipal,
    financing.loanInterestRatePct,
    financing.loanTenureMonths
  )
  const loanMonthlyRepayment = computeLoanRepaymentMonthly(
    loanPrincipal,
    financing.loanInterestRatePct,
    financing.loanTenureMonths
  )
  const loanInterestCostMonthly = financing.loanTenureMonths > 0
    ? loanTotalInterest / financing.loanTenureMonths
    : 0
  // Opportunity cost on down payment only (rest is borrowed)
  const loanOpportunityCostMonthly = loanUpfront * (financing.cashInvestmentReturnPct / 100) / 12

  // Effective monthly financing cost (on top of depreciation + running costs)
  const cashEffectiveMonthlyCost = cashOpportunityCostMonthly
  const loanEffectiveMonthlyCost = loanInterestCostMonthly + loanOpportunityCostMonthly

  const diff = cashEffectiveMonthlyCost - loanEffectiveMonthlyCost
  const financingAdvantage: FinancingComparison['financingAdvantage'] =
    Math.abs(diff) < 5 ? 'neutral' : diff > 0 ? 'loan' : 'cash'

  return {
    cashUpfront,
    cashOpportunityCostMonthly,
    loanUpfront,
    loanMonthlyRepayment,
    loanTotalInterest,
    loanInterestCostMonthly,
    loanOpportunityCostMonthly,
    cashEffectiveMonthlyCost,
    loanEffectiveMonthlyCost,
    financingAdvantage,
    monthlySavings: Math.abs(diff),
  }
}
