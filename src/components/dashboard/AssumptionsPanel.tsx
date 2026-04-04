import { useState } from 'react'
import type { Scenario } from '@/types/scenario'
import { getCoeMonthsRemaining, getScrapValue } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { FormField } from '@/components/ui/form-field'
import { formatCurrency } from '@/lib/utils'
import { ChevronDown, ChevronUp, Settings } from 'lucide-react'

interface Props {
  scenario: Scenario
}

export function AssumptionsPanel({ scenario }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { updateCar, updateLifestyle, updateCompensation, updateFinancing } = useScenarioStore()
  const id = scenario.id
  const { car, lifestyle, compensation, financing } = scenario

  const coeMonths = getCoeMonthsRemaining(car)
  const scrapValue = getScrapValue(car)

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
          Input Parameters
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-6">
          {/* Car Details */}
          <section className="rounded-md border bg-muted/30 p-4 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wide text-foreground border-b pb-2 mb-3">
              Car Details
            </h4>
            <FormField label="Car Name" type="text" value={car.name} onChange={(v) => updateCar(id, { name: v })} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Purchase Price" value={car.purchasePrice} onChange={(v) => numUpdate('car', 'purchasePrice', v)} prefix="$" />
              <FormField label="Annual Depreciation" value={car.annualDepreciation} onChange={(v) => numUpdate('car', 'annualDepreciation', v)} prefix="$" suffix="/yr" />
              <FormField label="COE Remaining (Years)" value={car.coeYears} onChange={(v) => numUpdate('car', 'coeYears', v)} suffix="years" min={0} max={10} />
              <FormField label="COE Remaining (Months)" value={car.coeMonths} onChange={(v) => numUpdate('car', 'coeMonths', v)} suffix="months" min={0} max={11} />
            </div>
            {/* Derived read-only values */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-muted p-2.5">
                <p className="text-xs text-muted-foreground">COE Remaining</p>
                <p className="text-sm font-semibold">{coeMonths} months</p>
              </div>
              <div className="rounded-md bg-muted p-2.5">
                <p className="text-xs text-muted-foreground">Est. Scrap Value</p>
                <p className="text-sm font-semibold">{formatCurrency(scrapValue)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Fuel Economy" value={car.fuelEconomyKmPerL} onChange={(v) => numUpdate('car', 'fuelEconomyKmPerL', v)} suffix="km/L" step={0.1} />
              <FormField label="Road Tax" value={car.annualRoadTax} onChange={(v) => numUpdate('car', 'annualRoadTax', v)} prefix="$" suffix="/yr" />
              <FormField label="Insurance" value={car.annualInsurance} onChange={(v) => numUpdate('car', 'annualInsurance', v)} prefix="$" suffix="/yr" />
            </div>
          </section>

          {/* Commute & Costs */}
          <section className="rounded-md border bg-muted/30 p-4 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wide text-foreground border-b pb-2 mb-3">
              Commute & Lifestyle
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Drive Time (one-way)" value={lifestyle.driveTimeMinutesOneWay} onChange={(v) => numUpdate('lifestyle', 'driveTimeMinutesOneWay', v)} suffix="min" />
              <FormField label="PT Time (one-way)" value={lifestyle.ptTimeMinutesOneWay} onChange={(v) => numUpdate('lifestyle', 'ptTimeMinutesOneWay', v)} suffix="min" />
              <FormField label="Distance (one-way)" value={lifestyle.commuteDistanceKm} onChange={(v) => numUpdate('lifestyle', 'commuteDistanceKm', v)} suffix="km" />
              <FormField label="Work Days" value={lifestyle.workDaysPerMonth} onChange={(v) => numUpdate('lifestyle', 'workDaysPerMonth', v)} suffix="/mo" />
              <FormField label="WFH Days" value={lifestyle.wfhDaysPerMonth} onChange={(v) => numUpdate('lifestyle', 'wfhDaysPerMonth', v)} suffix="/mo" />
              <FormField label="Weekend km" value={lifestyle.weekendMileageKm} onChange={(v) => numUpdate('lifestyle', 'weekendMileageKm', v)} suffix="km" />
              <FormField label="HDB Parking" value={lifestyle.hdbSeasonParkingMonthly} onChange={(v) => numUpdate('lifestyle', 'hdbSeasonParkingMonthly', v)} prefix="$" suffix="/mo" />
              <FormField label="Work Parking" value={lifestyle.workplaceParkingMonthly} onChange={(v) => numUpdate('lifestyle', 'workplaceParkingMonthly', v)} prefix="$" suffix="/mo" />
              <FormField label="Petrol" value={lifestyle.petrolPricePerL} onChange={(v) => numUpdate('lifestyle', 'petrolPricePerL', v)} prefix="$" suffix="/L" step={0.01} />
              <FormField label="MRT Daily" value={lifestyle.mrtDailyCost} onChange={(v) => numUpdate('lifestyle', 'mrtDailyCost', v)} prefix="$" suffix="/day" step={0.1} />
            </div>
          </section>

          {/* Income */}
          <section className="rounded-md border bg-muted/30 p-4 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wide text-foreground border-b pb-2 mb-3">
              Income
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Annual Total Comp" value={compensation.annualTotalComp} onChange={(v) => numUpdate('compensation', 'annualTotalComp', v)} prefix="$" suffix="/yr" />
              <FormField label="Hours Worked/Day" value={compensation.hoursWorkedPerDay} onChange={(v) => numUpdate('compensation', 'hoursWorkedPerDay', v)} suffix="hrs" step={0.5} />
            </div>
          </section>

          {/* Financing */}
          <section className="rounded-md border bg-muted/30 p-4 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wide text-foreground border-b pb-2 mb-3">
              Financing
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Investment Return" value={financing.cashInvestmentReturnPct} onChange={(v) => numUpdate('financing', 'cashInvestmentReturnPct', v)} suffix="% p.a." step={0.1} />
              <FormField label="Down Payment" value={financing.loanDownPayment} onChange={(v) => numUpdate('financing', 'loanDownPayment', v)} prefix="$" />
              <FormField label="Loan Interest" value={financing.loanInterestRatePct} onChange={(v) => numUpdate('financing', 'loanInterestRatePct', v)} suffix="% p.a." step={0.01} />
              <FormField label="Loan Tenure" value={financing.loanTenureMonths} onChange={(v) => numUpdate('financing', 'loanTenureMonths', v)} suffix="months" />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
