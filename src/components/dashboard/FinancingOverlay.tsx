import { useMemo } from 'react'
import type { Scenario, FinancingComparison } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { computeFinancingComparison } from '@/computation/financing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { formatCurrency } from '@/lib/utils'
import { Landmark, ArrowRight } from 'lucide-react'
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

function ComparisonTable({ financing }: { financing: FinancingComparison }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4 text-muted-foreground font-medium"></th>
            <th className="text-right py-2 px-4 font-semibold">Full Cash</th>
            <th className="text-right py-2 pl-4 font-semibold">Bank Loan</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr>
            <td className="py-2 pr-4 text-muted-foreground">Upfront payment</td>
            <td className="text-right py-2 px-4">{formatCurrency(financing.cashUpfront)}</td>
            <td className="text-right py-2 pl-4">{formatCurrency(financing.loanUpfront)}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-muted-foreground">Monthly repayment</td>
            <td className="text-right py-2 px-4 text-muted-foreground">—</td>
            <td className="text-right py-2 pl-4">{formatCurrency(financing.loanMonthlyRepayment)}/mo</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-muted-foreground">Total interest paid</td>
            <td className="text-right py-2 px-4 text-muted-foreground">—</td>
            <td className="text-right py-2 pl-4">{formatCurrency(financing.loanTotalInterest)}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4 text-muted-foreground">Opportunity cost (returns forgone)</td>
            <td className="text-right py-2 px-4">{formatCurrency(financing.cashOpportunityCostMonthly)}/mo</td>
            <td className="text-right py-2 pl-4">{formatCurrency(financing.loanOpportunityCostMonthly)}/mo</td>
          </tr>
          <tr className="font-semibold border-t-2">
            <td className="py-2 pr-4">Effective monthly financing cost</td>
            <td className={cn("text-right py-2 px-4", financing.financingAdvantage === 'cash' && 'text-sensible')}>
              {formatCurrency(financing.cashEffectiveMonthlyCost)}/mo
            </td>
            <td className={cn("text-right py-2 pl-4", financing.financingAdvantage === 'loan' && 'text-sensible')}>
              {formatCurrency(financing.loanEffectiveMonthlyCost)}/mo
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function FinancingOverlay({ scenario }: Props) {
  const { updateFinancing } = useScenarioStore()
  const id = scenario.id
  const { financing: fin, car } = scenario

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
        <ComparisonTable financing={comparison} />

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
        </div>
      </CardContent>
    </Card>
  )
}
