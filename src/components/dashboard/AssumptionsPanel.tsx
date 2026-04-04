import { useState } from 'react'
import type { Scenario } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { FormField } from '@/components/ui/form-field'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { ChevronDown, ChevronUp, Settings } from 'lucide-react'

interface Props {
  scenario: Scenario
}

export function AssumptionsPanel({ scenario }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { updateCar, updateLifestyle, updateCompensation, updateFinancing } = useScenarioStore()
  const id = scenario.id
  const { car, lifestyle, compensation, financing } = scenario

  function numUpdate(section: 'car' | 'lifestyle' | 'compensation' | 'financing', field: string, raw: string) {
    const value = raw === '' ? 0 : parseFloat(raw)
    const val = isNaN(value) ? 0 : value
    const updaters = { car: updateCar, lifestyle: updateLifestyle, compensation: updateCompensation, financing: updateFinancing }
    updaters[section](id, { [field]: val })
  }

  return (
    <div className="border rounded-lg bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-lg"
      >
        <span className="flex items-center gap-2 font-semibold text-sm">
          <Settings className="h-4 w-4" />
          Your Assumptions
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-6 border-t">
          {/* Car Details */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Car Details</h4>
            <FormField label="Car Name" type="text" value={car.name} onChange={(v) => updateCar(id, { name: v })} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Purchase Price" value={car.purchasePrice || ''} onChange={(v) => numUpdate('car', 'purchasePrice', v)} prefix="$" />
              <FormField label="Scrap Value" value={car.scrapValue || ''} onChange={(v) => numUpdate('car', 'scrapValue', v)} prefix="$" />
              <FormField label="COE Tenure" value={car.coeTenureYears || ''} onChange={(v) => numUpdate('car', 'coeTenureYears', v)} suffix="yrs" />
              <FormField label="Engine CC" value={car.engineCC || ''} onChange={(v) => numUpdate('car', 'engineCC', v)} suffix="cc" />
              <FormField label="Fuel Economy" value={car.fuelEconomyKmPerL || ''} onChange={(v) => numUpdate('car', 'fuelEconomyKmPerL', v)} suffix="km/L" step={0.1} />
              <FormField label="Road Tax" value={car.annualRoadTax || ''} onChange={(v) => numUpdate('car', 'annualRoadTax', v)} prefix="$" suffix="/yr" />
              <FormField label="Insurance" value={car.annualInsurance || ''} onChange={(v) => numUpdate('car', 'annualInsurance', v)} prefix="$" suffix="/yr" />
            </div>
          </section>

          {/* Lifestyle */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Commute & Costs</h4>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Drive Time" value={lifestyle.driveTimeMinutesOneWay || ''} onChange={(v) => numUpdate('lifestyle', 'driveTimeMinutesOneWay', v)} suffix="min" />
              <FormField label="PT Time" value={lifestyle.ptTimeMinutesOneWay || ''} onChange={(v) => numUpdate('lifestyle', 'ptTimeMinutesOneWay', v)} suffix="min" />
              <FormField label="Distance" value={lifestyle.commuteDistanceKm || ''} onChange={(v) => numUpdate('lifestyle', 'commuteDistanceKm', v)} suffix="km" />
              <FormField label="Work Days" value={lifestyle.workDaysPerMonth || ''} onChange={(v) => numUpdate('lifestyle', 'workDaysPerMonth', v)} suffix="/mo" />
              <FormField label="WFH Days" value={lifestyle.wfhDaysPerMonth || ''} onChange={(v) => numUpdate('lifestyle', 'wfhDaysPerMonth', v)} suffix="/mo" />
              <FormField label="Weekend km" value={lifestyle.weekendMileageKm || ''} onChange={(v) => numUpdate('lifestyle', 'weekendMileageKm', v)} suffix="km" />
              <FormField label="HDB Parking" value={lifestyle.hdbSeasonParkingMonthly || ''} onChange={(v) => numUpdate('lifestyle', 'hdbSeasonParkingMonthly', v)} prefix="$" />
              <FormField label="Work Parking" value={lifestyle.workplaceParkingMonthly || ''} onChange={(v) => numUpdate('lifestyle', 'workplaceParkingMonthly', v)} prefix="$" />
              <FormField label="Petrol" value={lifestyle.petrolPricePerL || ''} onChange={(v) => numUpdate('lifestyle', 'petrolPricePerL', v)} prefix="$" suffix="/L" />
              <FormField label="MRT Daily" value={lifestyle.mrtDailyCost || ''} onChange={(v) => numUpdate('lifestyle', 'mrtDailyCost', v)} prefix="$" />
            </div>
          </section>

          {/* Compensation */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compensation</h4>
            <FormField label="Annual Total Comp" value={compensation.annualTotalComp || ''} onChange={(v) => numUpdate('compensation', 'annualTotalComp', v)} prefix="$" suffix="/yr" />
          </section>

          {/* Financing */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Financing</h4>
            <div className="space-y-2">
              <Label className="text-xs">Payment Mode</Label>
              <Select value={financing.mode} onChange={(e) => updateFinancing(id, { mode: e.target.value as 'cash' | 'loan' })}>
                <option value="cash">Cash</option>
                <option value="loan">Loan</option>
              </Select>
            </div>
            {financing.mode === 'loan' ? (
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Down Payment" value={financing.downPayment || ''} onChange={(v) => numUpdate('financing', 'downPayment', v)} prefix="$" />
                <FormField label="Interest Rate" value={financing.loanInterestRatePct || ''} onChange={(v) => numUpdate('financing', 'loanInterestRatePct', v)} suffix="%" step={0.01} />
                <FormField label="Loan Tenure" value={financing.loanTenureYears || ''} onChange={(v) => numUpdate('financing', 'loanTenureYears', v)} suffix="yrs" />
              </div>
            ) : (
              <FormField label="Investment Return" value={financing.investmentReturnRatePct || ''} onChange={(v) => numUpdate('financing', 'investmentReturnRatePct', v)} suffix="% p.a." step={0.1} />
            )}
          </section>
        </div>
      )}
    </div>
  )
}
