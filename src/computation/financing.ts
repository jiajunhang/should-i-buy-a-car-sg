import type { CarInputs, FinancingInputs, FinancingComparison } from '@/types/scenario'
import { getScrapValue } from '@/types/scenario'

/**
 * Compute monthly loan repayment using standard amortisation formula.
 */
export function computeLoanRepaymentMonthly(principal: number, annualRatePct: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0
  const monthlyRate = annualRatePct / 100 / 12
  if (monthlyRate === 0) return principal / tenureMonths
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
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
  const loanMonthlyRepayment = computeLoanRepaymentMonthly(
    loanPrincipal,
    financing.loanInterestRatePct,
    financing.loanTenureMonths
  )
  const loanTotalInterest = financing.loanTenureMonths > 0
    ? (loanMonthlyRepayment * financing.loanTenureMonths) - loanPrincipal
    : 0
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
