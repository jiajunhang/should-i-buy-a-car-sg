import type { Scenario } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { formatCurrency } from '@/lib/utils'
import { SlidersHorizontal, AlertTriangle } from 'lucide-react'

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

  const actualMinutesSaved = scenario.lifestyle.ptTimeMinutesDaily - scenario.lifestyle.driveTimeMinutesDaily
  const drivingIsSlower = actualMinutesSaved < 0
  const sliderValue = Math.max(0, actualMinutesSaved)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Explore Scenarios
        </CardTitle>
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

        {drivingIsSlower && (
          <div className="flex items-start gap-2 rounded-md bg-hard-to-justify/5 border border-hard-to-justify/30 p-3">
            <AlertTriangle className="h-4 w-4 text-hard-to-justify flex-shrink-0 mt-0.5" />
            <p className="text-xs text-hard-to-justify">
              Driving is slower than public transport for your commute — car ownership is harder to justify on time value alone.
            </p>
          </div>
        )}

        <SliderControl
          label="Minutes Saved Per Day (Driving vs Public Transport)"
          value={sliderValue}
          displayValue={`${sliderValue} min`}
          onChange={(v) => {
            const newDriveTime = Math.max(0, scenario.lifestyle.ptTimeMinutesDaily - v)
            updateLifestyle(id, { driveTimeMinutesDaily: Math.round(newDriveTime) })
          }}
          min={0}
          max={120}
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
