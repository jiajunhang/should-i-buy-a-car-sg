import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScenarioStore } from '@/store/scenarioStore'
import { Button } from '@/components/ui/button'
import { Step1Car } from './Step1Car'
import { Step2Life } from './Step2Life'
import { Step3Comp } from './Step3Comp'
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'

const STEPS = [
  { title: 'Your Car', component: Step1Car },
  { title: 'Your Life', component: Step2Life },
  { title: 'Your Compensation', component: Step3Comp },
] as const

export function WizardFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()
  const { scenarios, activeScenarioId, createScenario, completeWizard } = useScenarioStore()

  // Create a scenario if none exists
  if (scenarios.length === 0 || !activeScenarioId) {
    createScenario('My First Scenario')
  }

  const StepComponent = STEPS[currentStep].component

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeWizard()
      navigate('/dashboard')
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Should I Buy a Car?</h1>
          <p className="mt-2 text-muted-foreground">
            A data-driven tool for Singapore car ownership decisions
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(i)}
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
        <StepComponent />

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
    </div>
  )
}
