import { useMemo } from 'react'
import type { Scenario, FinancingComparison } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { computeFinancingComparison, computeLoanRepaymentMonthly } from '@/computation/financing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Landmark, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  scenario: Scenario
}

function SliderWithInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  suffix?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">{label}</span>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
            }}
            className="w-24 h-8 text-sm text-right"
            min={min}
            max={max}
            step={step}
          />
          {suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{suffix}</span>}
        </div>
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

  // Chart: down payment vs effective monthly cost for both cash and loan
  const chartData = useMemo(() => {
    const points = []
    const maxDp = car.purchasePrice
    const dpStep = Math.max(1000, Math.round(maxDp / 40))
    for (let dp = 0; dp <= maxDp; dp += dpStep) {
      const loanPrincipal = Math.max(0, car.purchasePrice - dp)
      const loanMonthly = computeLoanRepaymentMonthly(loanPrincipal, fin.loanInterestRatePct, fin.loanTenureMonths)
      const loanTotalInterest = fin.loanTenureMonths > 0
        ? (loanMonthly * fin.loanTenureMonths) - loanPrincipal
        : 0
      const loanInterestMonthly = fin.loanTenureMonths > 0 ? loanTotalInterest / fin.loanTenureMonths : 0
      const loanDpOpportunity = dp * (fin.cashInvestmentReturnPct / 100) / 12

      // Cash: opportunity cost on full purchase price (constant regardless of dp slider)
      const avgCashCapital = (car.purchasePrice + car.scrapValue) / 2
      const cashOpp = avgCashCapital * (fin.cashInvestmentReturnPct / 100) / 12

      points.push({
        dp: Math.round(dp / 1000),
        cash: Math.round(cashOpp),
        loan: Math.round(loanInterestMonthly + loanDpOpportunity),
      })
    }
    return points
  }, [car, fin])

  const verdictText = comparison.financingAdvantage === 'loan'
    ? `Taking a loan saves ~${formatCurrency(comparison.monthlySavings)}/mo in financing costs vs paying cash.`
    : comparison.financingAdvantage === 'cash'
      ? `Paying cash saves ~${formatCurrency(comparison.monthlySavings)}/mo in financing costs vs a loan.`
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
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground">Adjust financing variables</h4>
          <SliderWithInput
            label="Investment Return Rate"
            value={fin.cashInvestmentReturnPct}
            onChange={(v) => updateFinancing(id, { cashInvestmentReturnPct: v })}
            min={0}
            max={10}
            step={0.1}
            suffix="% p.a."
          />
          <SliderWithInput
            label="Loan Interest Rate"
            value={fin.loanInterestRatePct}
            onChange={(v) => updateFinancing(id, { loanInterestRatePct: v })}
            min={0}
            max={6}
            step={0.01}
            suffix="% p.a."
          />
          <SliderWithInput
            label="Down Payment"
            value={fin.loanDownPayment}
            onChange={(v) => updateFinancing(id, { loanDownPayment: v })}
            min={0}
            max={car.purchasePrice}
            step={1000}
            suffix=""
          />
        </div>

        {/* Chart */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground mb-4">
            Down Payment vs Monthly Financing Cost
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dp"
                tickFormatter={(v) => `$${v}k`}
                label={{ value: 'Down Payment ($k)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                label={{ value: 'Monthly Cost ($)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value)) + '/mo'}
                labelFormatter={(v) => `Down payment: $${v}k`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cash"
                name="Cash (opportunity cost)"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="loan"
                name="Loan (interest + DP opp. cost)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground text-center mt-2">
            The lower line at your chosen down payment represents the cheaper financing option.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
