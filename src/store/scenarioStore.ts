import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Scenario, CarInputs, LifestyleInputs, CompensationInputs, FinancingInputs } from '@/types/scenario'
import { getCoeMonthsRemaining } from '@/types/scenario'
import { DEFAULT_CAR, DEFAULT_LIFESTYLE, DEFAULT_COMPENSATION, DEFAULT_FINANCING } from '@/computation/defaults'

interface ScenarioStore {
  scenarios: Scenario[]
  activeScenarioId: string | null

  createScenario: () => string
  duplicateScenario: (id: string) => string
  deleteScenario: (id: string) => void
  setActiveScenario: (id: string) => void
  renameScenario: (id: string, name: string) => void
  updateCar: (id: string, car: Partial<CarInputs>) => void
  updateLifestyle: (id: string, lifestyle: Partial<LifestyleInputs>) => void
  updateCompensation: (id: string, compensation: Partial<CompensationInputs>) => void
  updateFinancing: (id: string, financing: Partial<FinancingInputs>) => void
  setWizardStep: (id: string, step: number | 'complete') => void
  getActiveScenario: () => Scenario | undefined
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function scenarioName(car: CarInputs): string {
  return car.name.trim() || 'New Car'
}

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      scenarios: [],
      activeScenarioId: null,

      createScenario: () => {
        const id = generateId()
        const newScenario: Scenario = {
          id,
          name: 'New Car',
          car: { ...DEFAULT_CAR },
          lifestyle: { ...DEFAULT_LIFESTYLE },
          compensation: { ...DEFAULT_COMPENSATION },
          financing: { ...DEFAULT_FINANCING },
          wizardStep: 0,
          createdAt: Date.now(),
        }
        set(state => ({
          scenarios: [...state.scenarios, newScenario],
          activeScenarioId: id,
        }))
        return id
      },

      duplicateScenario: (id: string) => {
        const source = get().scenarios.find(s => s.id === id)
        if (!source) return id
        const newId = generateId()
        const duplicate: Scenario = {
          ...structuredClone(source),
          id: newId,
          name: `${source.name} (copy)`,
          wizardStep: 'complete', // duplicates skip wizard
          createdAt: Date.now(),
        }
        set(state => ({
          scenarios: [...state.scenarios, duplicate],
          activeScenarioId: newId,
        }))
        return newId
      },

      deleteScenario: (id: string) => {
        set(state => {
          const filtered = state.scenarios.filter(s => s.id !== id)
          if (filtered.length === 0) {
            // Reset last scenario to fresh defaults + wizard step 0
            const freshId = generateId()
            const fresh: Scenario = {
              id: freshId,
              name: 'New Car',
              car: { ...DEFAULT_CAR },
              lifestyle: { ...DEFAULT_LIFESTYLE },
              compensation: { ...DEFAULT_COMPENSATION },
              financing: { ...DEFAULT_FINANCING },
              wizardStep: 0,
              createdAt: Date.now(),
            }
            return { scenarios: [fresh], activeScenarioId: freshId }
          }
          const newActive = state.activeScenarioId === id
            ? (filtered[0]?.id ?? null)
            : state.activeScenarioId
          return { scenarios: filtered, activeScenarioId: newActive }
        })
      },

      setActiveScenario: (id: string) => set({ activeScenarioId: id }),

      renameScenario: (id: string, name: string) => {
        set(state => ({
          scenarios: state.scenarios.map(s =>
            s.id === id ? { ...s, name } : s
          ),
        }))
      },

      updateCar: (id, car) => {
        set(state => ({
          scenarios: state.scenarios.map(s => {
            if (s.id !== id) return s
            const updatedCar = { ...s.car, ...car }
            // Auto-set loan tenure to max allowed when COE changes
            const coeChanged = car.coeYears !== undefined || car.coeMonths !== undefined
            const maxLoan = Math.min(getCoeMonthsRemaining(updatedCar), 84)
            const updatedFinancing = coeChanged
              ? { ...s.financing, loanTenureMonths: maxLoan }
              : s.financing
            return { ...s, car: updatedCar, financing: updatedFinancing, name: scenarioName(updatedCar) }
          }),
        }))
      },

      updateLifestyle: (id, lifestyle) => {
        set(state => ({
          scenarios: state.scenarios.map(s =>
            s.id === id ? { ...s, lifestyle: { ...s.lifestyle, ...lifestyle } } : s
          ),
        }))
      },

      updateCompensation: (id, compensation) => {
        set(state => ({
          scenarios: state.scenarios.map(s =>
            s.id === id ? { ...s, compensation: { ...s.compensation, ...compensation } } : s
          ),
        }))
      },

      updateFinancing: (id, financing) => {
        set(state => ({
          scenarios: state.scenarios.map(s =>
            s.id === id ? { ...s, financing: { ...s.financing, ...financing } } : s
          ),
        }))
      },

      setWizardStep: (id: string, step: number | 'complete') => {
        set(state => ({
          scenarios: state.scenarios.map(s =>
            s.id === id ? { ...s, wizardStep: step } : s
          ),
        }))
      },

      getActiveScenario: () => {
        const state = get()
        return state.scenarios.find(s => s.id === state.activeScenarioId)
      },
    }),
    {
      name: 'car-decision-scenarios',
    }
  )
)
