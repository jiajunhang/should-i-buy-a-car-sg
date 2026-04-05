import type { Scenario } from '@/types/scenario'
import { getCoeMonthsRemaining } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip } from '@/components/ui/tooltip'
import { DollarSign, Landmark, Info } from 'lucide-react'
import { computeCostPerMinute, computeCostPerHour } from '@/computation/timeValue'
import { formatCurrency, formatCurrencyDetailed } from '@/lib/utils'

interface Props {
  scenario: Scenario
}

function SliderWithValue({
  label,
  tooltip,
  value,
  displayValue,
  onChange,
  min,
  max,
  step,
  minLabel,
  maxLabel,
}: {
  label: string
  tooltip?: string
  value: number
  displayValue: string
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  minLabel?: string
  maxLabel?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <Label>{label}</Label>
          {tooltip && (
            <Tooltip content={tooltip}>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </Tooltip>
          )}
        </div>
        <span className="text-sm font-semibold">{displayValue}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{minLabel ?? min}</span>
        <span>{maxLabel ?? max}</span>
      </div>
    </div>
  )
}

export function Step3Comp({ scenario }: Props) {
  const { updateCompensation, updateFinancing } = useScenarioStore()
  const { compensation, financing, car } = scenario
  const id = scenario.id

  const costPerMin = computeCostPerMinute(compensation)
  const costPerHour = computeCostPerHour(compensation)

  const coeMonths = getCoeMonthsRemaining(car)
  const maxLoanMonths = Math.min(coeMonths, 84)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Income
          </CardTitle>
          <CardDescription>
            Your compensation powers the time-value calculation — the key insight most people miss when evaluating car ownership.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Salary: slider + editable input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <Label>Annual Total Compensation</Label>
                <Tooltip content="Used to compute the value of your time. Feel free to use gross, net, or whatever figure best represents your earning rate.">
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  className="w-28 h-8 text-sm text-right font-semibold"
                  value={compensation.annualTotalComp}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                    updateCompensation(id, { annualTotalComp: isNaN(val) ? 0 : val })
                  }}
                  min={0}
                  step={1000}
                />
                <span className="text-sm text-muted-foreground">/yr</span>
              </div>
            </div>
            <Slider
              value={[compensation.annualTotalComp]}
              onValueChange={([v]) => updateCompensation(id, { annualTotalComp: v })}
              min={0}
              max={500000}
              step={1000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>{formatCurrency(500000)}</span>
            </div>
          </div>

          <SliderWithValue
            label="Average Hours Worked Per Day"
            tooltip="Affects how your time is valued. Default is 9 hours (typical office day including lunch)."
            value={compensation.hoursWorkedPerDay}
            displayValue={`${compensation.hoursWorkedPerDay} hrs`}
            onChange={(v) => updateCompensation(id, { hoursWorkedPerDay: v })}
            min={4}
            max={16}
            step={0.5}
            minLabel="4 hrs"
            maxLabel="16 hrs"
          />

          <div className="rounded-md bg-muted p-4 text-sm space-y-1">
            <p className="text-muted-foreground">
              Your time is worth <span className="font-semibold text-foreground">{formatCurrencyDetailed(costPerHour)}/hr</span>
              {' '}(<span className="font-semibold text-foreground">{formatCurrencyDetailed(costPerMin)}/min</span>).
            </p>
            <p className="text-muted-foreground text-xs">
              Every minute saved on your commute has real economic value.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Financing Details
          </CardTitle>
          <CardDescription>
            We'll compare both financing options on the dashboard. Fill in details for each scenario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cash section */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">If paying full cash</h4>
            <SliderWithValue
              label="Expected Investment Return"
              tooltip="If you didn't buy the car, what return could you earn? CPF OA: ~2.5%, SSB: ~3%, ETFs: ~4-7%."
              value={financing.cashInvestmentReturnPct}
              displayValue={`${financing.cashInvestmentReturnPct}% p.a.`}
              onChange={(v) => updateFinancing(id, { cashInvestmentReturnPct: v })}
              min={0}
              max={10}
              step={0.1}
              minLabel="0%"
              maxLabel="10%"
            />
            <p className="text-xs text-muted-foreground">
              This represents the opportunity cost — returns you forgo by spending cash on a car instead of investing it.
            </p>
          </section>

          <div className="border-t" />

          {/* Loan section */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">If taking a bank loan</h4>
            <SliderWithValue
              label="Down Payment"
              tooltip="MAS rules: minimum 30% for OMV <= $20k, 40% for OMV > $20k."
              value={financing.loanDownPayment}
              displayValue={formatCurrency(financing.loanDownPayment)}
              onChange={(v) => updateFinancing(id, { loanDownPayment: v })}
              min={0}
              max={car.purchasePrice}
              step={1000}
              minLabel="$0"
              maxLabel={formatCurrency(car.purchasePrice)}
            />
            <SliderWithValue
              label="Loan Interest Rate"
              tooltip="Typical Singapore car loan rates: 2.5%-3.5% p.a. (flat rate)."
              value={financing.loanInterestRatePct}
              displayValue={`${financing.loanInterestRatePct}% p.a.`}
              onChange={(v) => updateFinancing(id, { loanInterestRatePct: v })}
              min={0}
              max={6}
              step={0.01}
              minLabel="0%"
              maxLabel="6%"
            />
            <SliderWithValue
              label="Loan Tenure"
              tooltip={`Max: lesser of COE remaining (${coeMonths} months) or 84 months (7 years).`}
              value={financing.loanTenureMonths}
              displayValue={`${financing.loanTenureMonths} months`}
              onChange={(v) => updateFinancing(id, { loanTenureMonths: v })}
              min={12}
              max={maxLoanMonths}
              step={1}
              minLabel="12 mo"
              maxLabel={`${maxLoanMonths} mo`}
            />
            <p className="text-xs text-muted-foreground">
              Max loan tenure in Singapore: lesser of 7 years (84 months) or remaining COE ({coeMonths} months).
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
