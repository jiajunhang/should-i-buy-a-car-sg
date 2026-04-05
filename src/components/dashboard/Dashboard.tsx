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
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface Props {
  scenario: Scenario
}

export function Dashboard({ scenario }: Props) {
  const analysis = useMemo(() => analyseScenario(scenario), [scenario])

  return (
    <div className="space-y-6">
      {/* Export button */}
      <div className="flex justify-end" data-print-hide>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Verdict */}
      <InequalityVerdict analysis={analysis} />

      {/* Input parameters (collapsible) */}
      <AssumptionsPanel scenario={scenario} />

      {/* Interactive sliders */}
      <div data-print-hide>
        <InteractiveSliders scenario={scenario} />
      </div>

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
