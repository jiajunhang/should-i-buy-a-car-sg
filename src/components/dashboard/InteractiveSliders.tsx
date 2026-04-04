import type { Scenario } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { SlidersHorizontal } from 'lucide-react'

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
  formatValue,
  suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  formatValue?: (v: number) => string
  suffix?: string
}) {
  return (
    <div className="space-y-3">
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
            className="w-28 h-8 text-sm text-right"
            min={min}
            max={max}
            step={step}
          />
          {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  )
}

export function InteractiveSliders({ scenario }: Props) {
  const { updateCompensation, updateLifestyle } = useScenarioStore()
  const id = scenario.id

  const minutesSaved = (scenario.lifestyle.ptTimeMinutesOneWay - scenario.lifestyle.driveTimeMinutesOneWay) * 2

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Explore Scenarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <SliderWithInput
          label="Annual Compensation"
          value={scenario.compensation.annualTotalComp}
          onChange={(v) => updateCompensation(id, { annualTotalComp: v })}
          min={30000}
          max={500000}
          step={1000}
          formatValue={(v) => formatCurrency(v)}
          suffix="/yr"
        />

        <SliderWithInput
          label="Minutes Saved Per Day (Driving vs PT)"
          value={minutesSaved}
          onChange={(v) => {
            // Adjust drive time to achieve the desired savings
            // savings = (ptTime - driveTime) * 2, so driveTime = ptTime - savings/2
            const newDriveTime = Math.max(0, scenario.lifestyle.ptTimeMinutesOneWay - v / 2)
            updateLifestyle(id, { driveTimeMinutesOneWay: Math.round(newDriveTime) })
          }}
          min={-60}
          max={120}
          step={1}
          formatValue={(v) => `${v} min`}
          suffix="min"
        />

        <SliderWithInput
          label="WFH Days per Month"
          value={scenario.lifestyle.wfhDaysPerMonth}
          onChange={(v) => updateLifestyle(id, { wfhDaysPerMonth: v })}
          min={0}
          max={21}
          step={1}
          formatValue={(v) => `${v} days`}
          suffix="days"
        />
      </CardContent>
    </Card>
  )
}
