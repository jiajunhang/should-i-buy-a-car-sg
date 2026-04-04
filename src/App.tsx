import { useEffect } from 'react'
import { useScenarioStore } from '@/store/scenarioStore'
import { ScenarioTabs } from '@/components/dashboard/ScenarioTabs'
import { WizardFlow } from '@/components/wizard/WizardFlow'
import { Dashboard } from '@/components/dashboard/Dashboard'

export default function App() {
  const { scenarios, activeScenarioId, createScenario } = useScenarioStore()

  // Bootstrap: create first scenario if store is empty
  useEffect(() => {
    if (scenarios.length === 0) {
      createScenario()
    }
  }, [scenarios.length, createScenario])

  const scenario = scenarios.find(s => s.id === activeScenarioId) ?? scenarios[0]
  if (!scenario) return null

  const isWizard = scenario.wizardStep !== 'complete'

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Should I Buy a Car?</h1>
          <p className="text-sm text-muted-foreground">
            A data-driven tool for Singapore car ownership decisions
          </p>
        </div>

        {/* Scenario tabs — always visible */}
        <ScenarioTabs />

        {/* Per-scenario content: wizard or dashboard */}
        <div className="mt-6">
          {isWizard ? (
            <WizardFlow scenario={scenario} />
          ) : (
            <Dashboard scenario={scenario} />
          )}
        </div>
      </div>
    </div>
  )
}
