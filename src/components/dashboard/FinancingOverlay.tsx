import { useMemo, useState } from 'react'
import type { Scenario, FinancingComparison } from '@/types/scenario'
import { getCoeMonthsRemaining, getScrapValue } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { computeFinancingComparison } from '@/computation/financing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { formatCurrency, formatCurrencyDetailed } from '@/lib/utils'
import { Landmark, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  scenario: Scenario
}

function SliderControl({
  label,
  value,
  displayValue,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  value: number
  displayValue: string
  onChange: (v: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-semibold">{displayValue}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
    </div>
  )
}

function DetailRow({
  label,
  cashValue,
  loanValue,
  cashHighlight,
  loanHighlight,
  bold,
  cashDetail,
  loanDetail,
}: {
  label: string
  cashValue: string
  loanValue: string
  cashHighlight?: boolean
  loanHighlight?: boolean
  bold?: boolean
  cashDetail?: string[]
  loanDetail?: string[]
}) {
  const [expanded, setExpanded] = useState(false)
  const hasDetail = (cashDetail && cashDetail.length > 0) || (loanDetail && loanDetail.length > 0)

  return (
    <>
      <tr
        className={cn(hasDetail && 'cursor-pointer hover:bg-muted/50')}
        onClick={() => hasDetail && setExpanded(!expanded)}
      >
        <td className={cn('py-2 pr-4', bold ? 'font-semibold' : 'text-muted-foreground')}>
          <span className="flex items-center gap-1">
            {label}
            {hasDetail && (
              expanded
                ? <ChevronUp className="h-3 w-3 text-muted-foreground" />
                : <ChevronDown className="h-3 w-3 text-muted-foreground" />
            )}
          </span>
        </td>
        <td className={cn('text-right py-2 px-4', cashHighlight && 'text-sensible', bold && 'font-semibold')}>
          {cashValue}
        </td>
        <td className={cn('text-right py-2 pl-4', loanHighlight && 'text-sensible', bold && 'font-semibold')}>
          {loanValue}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td className="pb-3" />
          <td className="pb-3 px-4 align-top">
            {cashDetail && cashDetail.length > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2 space-y-0.5">
                {cashDetail.map((line, i) => <p key={i}>{line}</p>)}
              </div>
            )}
          </td>
          <td className="pb-3 pl-4 align-top">
            {loanDetail && loanDetail.length > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2 space-y-0.5">
                {loanDetail.map((line, i) => <p key={i}>{line}</p>)}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

function ComparisonTable({ financing, scenario }: { financing: FinancingComparison; scenario: Scenario }) {
  const { car, financing: fin } = scenario
  const loanPrincipal = Math.max(0, car.purchasePrice - fin.loanDownPayment)
  const tenureMonths = fin.loanTenureMonths
  const scrapValue = getScrapValue(car)
  const avgCashCapital = (car.purchasePrice + scrapValue) / 2

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">
              <span className="text-xs">Click a row to see the calculation</span>
            </th>
            <th className="text-right py-2 px-4 font-semibold">Full Cash</th>
            <th className="text-right py-2 pl-4 font-semibold">Bank Loan</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <DetailRow
            label="Upfront payment"
            cashValue={formatCurrency(financing.cashUpfront)}
            loanValue={formatCurrency(financing.loanUpfront)}
            cashDetail={[`= Purchase price: ${formatCurrency(car.purchasePrice)}`]}
            loanDetail={[`= Down payment: ${formatCurrency(fin.loanDownPayment)}`]}
          />
          <DetailRow
            label="Monthly repayment"
            cashValue="—"
            loanValue={`${formatCurrency(financing.loanMonthlyRepayment)}/mo`}
            loanDetail={[
              `Principal = ${formatCurrency(car.purchasePrice)} − ${formatCurrency(fin.loanDownPayment)} = ${formatCurrency(loanPrincipal)}`,
              `Interest = ${formatCurrency(loanPrincipal)} × ${fin.loanInterestRatePct}% × ${tenureMonths} mo ÷ 12 = ${formatCurrency(financing.loanTotalInterest)}`,
              `Monthly = (${formatCurrency(loanPrincipal)} + ${formatCurrency(financing.loanTotalInterest)}) ÷ ${tenureMonths} mo = ${formatCurrency(financing.loanMonthlyRepayment)}`,
            ]}
          />
          <DetailRow
            label="Total interest paid"
            cashValue="—"
            loanValue={formatCurrency(financing.loanTotalInterest)}
            loanDetail={[
              `= ${formatCurrency(loanPrincipal)} × ${fin.loanInterestRatePct}% × (${tenureMonths} ÷ 12) years`,
              `= ${formatCurrency(financing.loanTotalInterest)}`,
              `(SG flat-rate: interest on original principal for full term)`,
            ]}
          />
          <DetailRow
            label="Opportunity cost (returns forgone)"
            cashValue={`${formatCurrency(financing.cashOpportunityCostMonthly)}/mo`}
            loanValue={`${formatCurrency(financing.loanOpportunityCostMonthly)}/mo`}
            cashDetail={[
              `Car depreciates from ${formatCurrency(car.purchasePrice)} to ${formatCurrency(scrapValue)} (scrap)`,
              `Avg capital tied up ≈ (${formatCurrency(car.purchasePrice)} + ${formatCurrency(scrapValue)}) ÷ 2 = ${formatCurrency(avgCashCapital)}`,
              `= ${formatCurrency(avgCashCapital)} × ${fin.cashInvestmentReturnPct}% ÷ 12`,
              `= ${formatCurrencyDetailed(financing.cashOpportunityCostMonthly)}/mo`,
            ]}
            loanDetail={[
              `Only on down payment (rest is borrowed):`,
              `= ${formatCurrency(fin.loanDownPayment)} × ${fin.cashInvestmentReturnPct}% ÷ 12`,
              `= ${formatCurrencyDetailed(financing.loanOpportunityCostMonthly)}/mo`,
            ]}
          />
          <DetailRow
            label="Effective monthly financing cost"
            cashValue={`${formatCurrency(financing.cashEffectiveMonthlyCost)}/mo`}
            loanValue={`${formatCurrency(financing.loanEffectiveMonthlyCost)}/mo`}
            cashHighlight={financing.financingAdvantage === 'cash'}
            loanHighlight={financing.financingAdvantage === 'loan'}
            bold
            cashDetail={[
              `= Opportunity cost only`,
              `= ${formatCurrencyDetailed(financing.cashOpportunityCostMonthly)}/mo`,
            ]}
            loanDetail={[
              `= Interest cost/mo + Opportunity cost on DP/mo`,
              `= ${formatCurrency(financing.loanTotalInterest)} ÷ ${tenureMonths} + ${formatCurrencyDetailed(financing.loanOpportunityCostMonthly)}`,
              `= ${formatCurrencyDetailed(financing.loanInterestCostMonthly)} + ${formatCurrencyDetailed(financing.loanOpportunityCostMonthly)}`,
              `= ${formatCurrencyDetailed(financing.loanEffectiveMonthlyCost)}/mo`,
            ]}
          />
        </tbody>
      </table>
    </div>
  )
}

export function FinancingOverlay({ scenario }: Props) {
  const { updateFinancing } = useScenarioStore()
  const id = scenario.id
  const { financing: fin, car } = scenario

  const coeMonths = getCoeMonthsRemaining(car)
  const maxLoanMonths = Math.min(coeMonths, 84)

  const comparison = useMemo(
    () => computeFinancingComparison(car, fin),
    [car, fin]
  )

  const verdictText = comparison.financingAdvantage === 'loan'
    ? `Taking a loan is better — saves ~${formatCurrency(comparison.monthlySavings)}/mo in effective financing costs.`
    : comparison.financingAdvantage === 'cash'
      ? `Paying in full cash is better — saves ~${formatCurrency(comparison.monthlySavings)}/mo in effective financing costs.`
      : 'Cash and loan are roughly equivalent in financing cost.'

  const verdictExplanation = comparison.financingAdvantage === 'loan'
    ? `Your expected investment return (${fin.cashInvestmentReturnPct}%) exceeds the loan rate (${fin.loanInterestRatePct}%). Keeping capital invested and borrowing is more efficient.`
    : comparison.financingAdvantage === 'cash'
      ? `The loan rate (${fin.loanInterestRatePct}%) exceeds your expected investment return (${fin.cashInvestmentReturnPct}%). Paying cash avoids the interest premium.`
      : `The loan rate and investment return are similar, so the financing method makes little difference.`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="h-5 w-5" />
          Financing Analysis: Cash vs Loan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Verdict */}
        <div className={cn(
          'rounded-md p-4 border',
          comparison.financingAdvantage === 'loan' ? 'bg-sensible/5 border-sensible/30' :
          comparison.financingAdvantage === 'cash' ? 'bg-chart-1/5 border-chart-1/30' :
          'bg-muted'
        )}>
          <div className="flex items-center gap-2 mb-1">
            <ArrowRight className="h-4 w-4" />
            <p className="font-semibold text-sm">{verdictText}</p>
          </div>
          <p className="text-xs text-muted-foreground">{verdictExplanation}</p>
        </div>

        {/* Comparison table */}
        <ComparisonTable financing={comparison} scenario={scenario} />

        {/* Interactive sliders */}
        <div className="space-y-4 pt-4 border-t" data-print-hide>
          <h4 className="text-sm font-semibold text-muted-foreground">Adjust financing variables</h4>
          <SliderControl
            label="Investment Return Rate"
            value={fin.cashInvestmentReturnPct}
            displayValue={`${fin.cashInvestmentReturnPct}% p.a.`}
            onChange={(v) => updateFinancing(id, { cashInvestmentReturnPct: v })}
            min={0}
            max={10}
            step={0.1}
          />
          <SliderControl
            label="Loan Interest Rate"
            value={fin.loanInterestRatePct}
            displayValue={`${fin.loanInterestRatePct}% p.a.`}
            onChange={(v) => updateFinancing(id, { loanInterestRatePct: v })}
            min={0}
            max={6}
            step={0.01}
          />
          <SliderControl
            label="Down Payment"
            value={fin.loanDownPayment}
            displayValue={formatCurrency(fin.loanDownPayment)}
            onChange={(v) => updateFinancing(id, { loanDownPayment: v })}
            min={0}
            max={car.purchasePrice}
            step={1000}
          />
          <SliderControl
            label="Loan Tenure"
            value={fin.loanTenureMonths}
            displayValue={`${fin.loanTenureMonths} months`}
            onChange={(v) => updateFinancing(id, { loanTenureMonths: v })}
            min={12}
            max={maxLoanMonths}
            step={1}
          />
        </div>
      </CardContent>
    </Card>
  )
}
