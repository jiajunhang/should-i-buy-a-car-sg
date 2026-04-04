import type { Scenario } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { formatCurrency } from '@/lib/utils'
import { SlidersHorizontal } from 'lucide-react'

interface Props {
  scenario: Scenario
}

export function InteractiveSliders({ scenario }: Props) {
  const { updateCompensation, updateLifestyle } = useScenarioStore()
  const id = scenario.id

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Explore Scenarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Annual Compensation</span>
            <span className="font-semibold">{formatCurrency(scenario.compensation.annualTotalComp)}/yr</span>
          </div>
          <Slider
            value={[scenario.compensation.annualTotalComp]}
            onValueChange={([v]) => updateCompensation(id, { annualTotalComp: v })}
            min={30000}
            max={500000}
            step={5000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$30k</span>
            <span>$500k</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Time Saved per Day (driving vs PT)</span>
            <span className="font-semibold">
              {(scenario.lifestyle.ptTimeMinutesOneWay - scenario.lifestyle.driveTimeMinutesOneWay) * 2} mins
            </span>
          </div>
          <Slider
            value={[scenario.lifestyle.driveTimeMinutesOneWay]}
            onValueChange={([v]) => updateLifestyle(id, { driveTimeMinutesOneWay: v })}
            min={5}
            max={120}
            step={5}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 min drive</span>
            <span>120 min drive</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>WFH Days per Month</span>
            <span className="font-semibold">{scenario.lifestyle.wfhDaysPerMonth} days</span>
          </div>
          <Slider
            value={[scenario.lifestyle.wfhDaysPerMonth]}
            onValueChange={([v]) => updateLifestyle(id, { wfhDaysPerMonth: v })}
            min={0}
            max={21}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 (full office)</span>
            <span>21 (full remote)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
