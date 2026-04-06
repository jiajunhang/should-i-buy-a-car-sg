import type { Scenario } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Button } from '@/components/ui/button'
import { Step1Car } from './Step1Car'
import { Step2Life } from './Step2Life'
import { Step3Comp } from './Step3Comp'
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'

const STEPS = [
  { title: 'Car Details', component: Step1Car },
  { title: 'Commute & Lifestyle', component: Step2Life },
  { title: 'Income & Financing', component: Step3Comp },
] as const

interface Props {
  scenario: Scenario
}

export function WizardFlow({ scenario }: Props) {
  const { setWizardStep } = useScenarioStore()
  const currentStep = typeof scenario.wizardStep === 'number' ? scenario.wizardStep : 0

  const StepComponent = STEPS[currentStep].component

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setWizardStep(scenario.id, currentStep + 1)
    } else {
      setWizardStep(scenario.id, 'complete')
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setWizardStep(scenario.id, currentStep - 1)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Context intro — shown on first step only */}
      {currentStep === 0 && (
        <div className="rounded-lg border bg-muted/50 p-4 mb-6 text-center">
          <p className="text-base font-semibold text-foreground">Should you buy this car? Let's find out.</p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium">Car</span> → <span className="font-medium">You</span> → <span className="font-medium">Verdict</span>
            <span className="mx-2">·</span>
            rough figures are fine
          </p>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex items-center gap-2">
            <button
              onClick={() => setWizardStep(scenario.id, i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                i === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : i < currentStep
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="font-medium">{i + 1}</span>
              <span className="hidden sm:inline">{step.title}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 ${i < currentStep ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <StepComponent scenario={scenario} />

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button onClick={handleNext}>
          {currentStep === STEPS.length - 1 ? (
            <>
              <BarChart3 className="h-4 w-4 mr-1" />
              View Dashboard
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
