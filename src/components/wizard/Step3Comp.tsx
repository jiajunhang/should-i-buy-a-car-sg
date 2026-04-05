import type { Scenario } from '@/types/scenario'
import { getCoeMonthsRemaining } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { DollarSign, Landmark } from 'lucide-react'
import { computeCostPerMinute, computeCostPerHour } from '@/computation/timeValue'
import { formatCurrencyDetailed } from '@/lib/utils'

interface Props {
  scenario: Scenario
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
        <CardContent className="space-y-4">
          <FormField
            label="Annual Total Compensation"
            tooltip="Used to compute the value of your time, which determines whether commute time savings outweigh the financial cost of car ownership. Feel free to use gross, net, or whatever figure you feel best represents your earning rate."
            value={compensation.annualTotalComp}
            onChange={(v) => {
              const val = v === '' ? 0 : parseFloat(v)
              updateCompensation(id, { annualTotalComp: isNaN(val) ? 0 : val })
            }}
            prefix="$"
            suffix="/yr"
          />

          <FormField
            label="Average Hours Worked Per Day"
            tooltip="Affects how your time is valued. Default is 9 hours (typical office day including lunch)."
            value={compensation.hoursWorkedPerDay}
            onChange={(v) => {
              const val = v === '' ? 0 : parseFloat(v)
              updateCompensation(id, { hoursWorkedPerDay: isNaN(val) ? 0 : val })
            }}
            suffix="hrs/day"
            step={0.5}
            min={1}
            max={16}
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
            <FormField
              label="Expected Investment Return"
              tooltip="If you didn't buy the car, what return could you earn? CPF OA: ~2.5%, SSB: ~3%, ETFs: ~4-7%."
              value={financing.cashInvestmentReturnPct}
              onChange={(v) => {
                const val = v === '' ? 0 : parseFloat(v)
                updateFinancing(id, { cashInvestmentReturnPct: isNaN(val) ? 0 : val })
              }}
              suffix="% p.a."
              step={0.1}
            />
            <p className="text-xs text-muted-foreground">
              This represents the opportunity cost — returns you forgo by spending cash on a car instead of investing it.
            </p>
          </section>

          <div className="border-t" />

          {/* Loan section */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">If taking a bank loan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Down Payment"
                tooltip="MAS rules: minimum 30% for OMV <= $20k, 40% for OMV > $20k."
                value={financing.loanDownPayment}
                onChange={(v) => {
                  const val = v === '' ? 0 : parseFloat(v)
                  updateFinancing(id, { loanDownPayment: isNaN(val) ? 0 : val })
                }}
                prefix="$"
              />
              <FormField
                label="Loan Interest Rate"
                tooltip="Typical Singapore car loan rates: 2.5%-3.5% p.a."
                value={financing.loanInterestRatePct}
                onChange={(v) => {
                  const val = v === '' ? 0 : parseFloat(v)
                  updateFinancing(id, { loanInterestRatePct: isNaN(val) ? 0 : val })
                }}
                suffix="% p.a."
                step={0.01}
              />
            </div>
            <FormField
              label="Loan Tenure"
              tooltip={`Auto-set to ${maxLoanMonths} months (lesser of COE remaining or 84 months / 7 years). Override if needed.`}
              value={financing.loanTenureMonths}
              onChange={(v) => {
                const val = v === '' ? 0 : parseFloat(v)
                updateFinancing(id, { loanTenureMonths: isNaN(val) ? 0 : Math.round(val) })
              }}
              suffix="months"
              max={maxLoanMonths}
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
