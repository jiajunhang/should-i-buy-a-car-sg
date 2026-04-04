import { useMemo } from 'react'
import type { Scenario } from '@/types/scenario'
import { analyseScenario } from '@/computation/analysis'
import { AssumptionsPanel } from './AssumptionsPanel'
import { InequalityVerdict } from './InequalityVerdict'
import { CostBreakdownChart } from './CostBreakdownChart'
import { BreakEvenCallout } from './BreakEvenCallout'
import { TimeValuePanel } from './TimeValuePanel'
import { InteractiveSliders } from './InteractiveSliders'
import { SensitivityChart } from './SensitivityChart'
import { FinancingOverlay } from './FinancingOverlay'

interface Props {
  scenario: Scenario
}

export function Dashboard({ scenario }: Props) {
  const analysis = useMemo(() => analyseScenario(scenario), [scenario])

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <InequalityVerdict analysis={analysis} />

      {/* Input parameters (collapsible) */}
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

      {/* Financing analysis */}
      <FinancingOverlay scenario={scenario} />
    </div>
  )
}
