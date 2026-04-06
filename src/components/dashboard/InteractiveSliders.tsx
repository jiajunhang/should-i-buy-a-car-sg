import type { Scenario } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { formatCurrency } from '@/lib/utils'
import { SlidersHorizontal } from 'lucide-react'

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
  formatBound,
}: {
  label: string
  value: number
  displayValue: string
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  formatBound?: (v: number) => string
}) {
  return (
    <div className="space-y-3">
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
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatBound ? formatBound(min) : min}</span>
        <span>{formatBound ? formatBound(max) : max}</span>
      </div>
    </div>
  )
}

export function InteractiveSliders({ scenario }: Props) {
  const { updateCompensation, updateLifestyle } = useScenarioStore()
  const id = scenario.id

  const driveTime = scenario.lifestyle.driveTimeMinutesDaily
  const ptTime = scenario.lifestyle.ptTimeMinutesDaily
  const minutesSaved = ptTime - driveTime
  const drivingIsSlower = minutesSaved < 0
  const savedLabel = drivingIsSlower
    ? `${Math.abs(minutesSaved)} min slower — harder to justify on time value alone`
    : `${minutesSaved} min saved`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          What if things change?
        </CardTitle>
        <CardDescription>
          Drag the sliders to see how your verdict shifts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <SliderControl
          label="Annual Compensation"
          value={scenario.compensation.annualTotalComp}
          displayValue={`${formatCurrency(scenario.compensation.annualTotalComp)}/yr`}
          onChange={(v) => updateCompensation(id, { annualTotalComp: v })}
          min={30000}
          max={500000}
          step={1000}
          formatBound={(v) => formatCurrency(v)}
        />

        <SliderControl
          label={`Daily Driving Time (${savedLabel})`}
          value={driveTime}
          displayValue={`${driveTime} min`}
          onChange={(v) => updateLifestyle(id, { driveTimeMinutesDaily: v })}
          min={0}
          max={240}
          step={1}
          formatBound={(v) => `${v} min`}
        />

        <SliderControl
          label="Daily Public Transport Time"
          value={ptTime}
          displayValue={`${ptTime} min`}
          onChange={(v) => updateLifestyle(id, { ptTimeMinutesDaily: v })}
          min={0}
          max={240}
          step={1}
          formatBound={(v) => `${v} min`}
        />

        <SliderControl
          label="Days You Commute per Month"
          value={scenario.lifestyle.commuteDaysPerMonth}
          displayValue={`${scenario.lifestyle.commuteDaysPerMonth} days`}
          onChange={(v) => updateLifestyle(id, { commuteDaysPerMonth: v })}
          min={0}
          max={31}
          step={1}
          formatBound={(v) => `${v} days`}
        />
      </CardContent>
    </Card>
  )
}
