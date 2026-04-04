import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { DollarSign } from 'lucide-react'
import { computeCostPerMinute } from '@/computation/timeValue'
import { formatCurrencyDetailed } from '@/lib/utils'

export function Step3Comp() {
  const { scenarios, activeScenarioId, updateCompensation, updateFinancing } = useScenarioStore()
  const scenario = scenarios.find(s => s.id === activeScenarioId)
  if (!scenario) return null

  const { compensation, financing } = scenario
  const id = scenario.id

  const costPerMin = computeCostPerMinute(compensation)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Your Compensation
          </CardTitle>
          <CardDescription>
            Your annual total compensation powers the time-value calculation — the key insight most people miss.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="Annual Total Compensation"
            tooltip="Base salary + bonus + stock + any other cash compensation, before tax."
            value={compensation.annualTotalComp || ''}
            onChange={(v) => {
              const val = v === '' ? 0 : parseFloat(v)
              updateCompensation(id, { annualTotalComp: isNaN(val) ? 0 : val })
            }}
            prefix="$"
            suffix="/yr"
          />

          <div className="rounded-md bg-muted p-4 text-sm">
            <p className="text-muted-foreground">
              Your time is worth <span className="font-semibold text-foreground">{formatCurrencyDetailed(costPerMin)}/min</span>.
              Every minute saved on your commute has real economic value.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financing</CardTitle>
          <CardDescription>
            How are you paying for the car? This affects cash flow analysis but not the core economic cost.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select
              value={financing.mode}
              onChange={(e) => updateFinancing(id, { mode: e.target.value as 'cash' | 'loan' })}
            >
              <option value="cash">Full cash payment</option>
              <option value="loan">Bank loan</option>
            </Select>
          </div>

          {financing.mode === 'loan' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Down Payment"
                tooltip="MAS rules: minimum 30% for OMV ≤ $20k, 40% for OMV > $20k."
                value={financing.downPayment || ''}
                onChange={(v) => {
                  const val = v === '' ? 0 : parseFloat(v)
                  updateFinancing(id, { downPayment: isNaN(val) ? 0 : val })
                }}
                prefix="$"
              />
              <FormField
                label="Loan Interest Rate"
                tooltip="Typical Singapore car loan rates: 2.5%–3.5% p.a."
                value={financing.loanInterestRatePct || ''}
                onChange={(v) => {
                  const val = v === '' ? 0 : parseFloat(v)
                  updateFinancing(id, { loanInterestRatePct: isNaN(val) ? 0 : val })
                }}
                suffix="% p.a."
                step={0.01}
              />
              <FormField
                label="Loan Tenure"
                tooltip="Maximum 7 years in Singapore."
                value={financing.loanTenureYears || ''}
                onChange={(v) => {
                  const val = v === '' ? 0 : parseFloat(v)
                  updateFinancing(id, { loanTenureYears: isNaN(val) ? 0 : val })
                }}
                suffix="years"
                max={7}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <FormField
                label="Expected Investment Return"
                tooltip="If you didn't buy the car, what return could you earn? CPF OA: ~2.5%, SSB: ~3%, ETFs: ~4-7%."
                value={financing.investmentReturnRatePct || ''}
                onChange={(v) => {
                  const val = v === '' ? 0 : parseFloat(v)
                  updateFinancing(id, { investmentReturnRatePct: isNaN(val) ? 0 : val })
                }}
                suffix="% p.a."
                step={0.1}
              />
              <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                This represents the opportunity cost of your capital — the returns you forgo by spending
                the money on a car instead of investing it.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
