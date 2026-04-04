import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScenarioStore } from '@/store/scenarioStore'
import { analyseScenario } from '@/computation/analysis'
import { ScenarioTabs } from './ScenarioTabs'
import { AssumptionsPanel } from './AssumptionsPanel'
import { InequalityVerdict } from './InequalityVerdict'
import { CostBreakdownChart } from './CostBreakdownChart'
import { BreakEvenCallout } from './BreakEvenCallout'
import { TimeValuePanel } from './TimeValuePanel'
import { InteractiveSliders } from './InteractiveSliders'
import { SensitivityChart } from './SensitivityChart'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function Dashboard() {
  const navigate = useNavigate()
  const { scenarios, activeScenarioId, wizardCompleted } = useScenarioStore()

  // Redirect to wizard if not completed
  if (!wizardCompleted || scenarios.length === 0) {
    navigate('/wizard')
    return null
  }

  const scenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0]

  const analysis = useMemo(() => analyseScenario(scenario), [scenario])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Should I Buy a Car?</h1>
            <p className="text-sm text-muted-foreground">
              {scenario.car.name || 'Your car'} — full cost analysis
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/wizard')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Wizard
          </Button>
        </div>

        {/* Scenario tabs */}
        <ScenarioTabs />

        <div className="mt-6 space-y-6">
          {/* Verdict */}
          <InequalityVerdict analysis={analysis} />

          {/* Assumptions panel (collapsible) */}
          <AssumptionsPanel scenario={scenario} />

          {/* Interactive sliders */}
          <InteractiveSliders scenario={scenario} />

          {/* Break-even + Time value side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BreakEvenCallout analysis={analysis} />
            <TimeValuePanel timeValue={analysis.timeValue} lifestyle={scenario.lifestyle} />
          </div>

          {/* Cost breakdown charts */}
          <CostBreakdownChart carCosts={analysis.carCosts} ptCosts={analysis.ptCosts} />

          {/* Sensitivity chart */}
          <SensitivityChart scenario={scenario} />
        </div>
      </div>
    </div>
  )
}
