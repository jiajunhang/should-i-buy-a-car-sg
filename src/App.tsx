import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WizardFlow } from '@/components/wizard/WizardFlow'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { useScenarioStore } from '@/store/scenarioStore'

function AppRoutes() {
  const { wizardCompleted } = useScenarioStore()

  return (
    <Routes>
      <Route path="/wizard" element={<WizardFlow />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to={wizardCompleted ? '/dashboard' : '/wizard'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
