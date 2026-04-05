import { useState } from 'react'
import type { Scenario } from '@/types/scenario'
import { getCoeMonthsRemaining, getScrapValue } from '@/types/scenario'
import { formatCurrency } from '@/lib/utils'
import { ChevronDown, ChevronUp, Settings } from 'lucide-react'

interface Props {
  scenario: Scenario
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export function AssumptionsPanel({ scenario }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { car, lifestyle, compensation, financing } = scenario

  const coeMonths = getCoeMonthsRemaining(car)
  const scrapValue = getScrapValue(car)

  return (
    <div className="border rounded-lg bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-lg"
        data-print-hide
      >
        <span className="flex items-center gap-2 font-semibold text-sm">
          <Settings className="h-4 w-4" />
          Input Parameters
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <div className={isOpen ? '' : 'hidden'} data-print-expand>
        <div className="px-4 pb-4 space-y-6">
          {/* Car Details */}
          <section className="rounded-md border bg-muted/30 p-4 space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wide text-foreground border-b pb-2 mb-2">
              Car Details
            </h4>
            <Field label="Car Name" value={car.name || 'New Car'} />
            <Field label="Purchase Price" value={formatCurrency(car.purchasePrice)} />
            <Field label="Annual Depreciation" value={`${formatCurrency(car.annualDepreciation)}/yr`} />
            <Field label="COE Remaining" value={`${car.coeYears}y ${car.coeMonths}m (${coeMonths} months)`} />
            <Field label="Est. Scrap Value" value={formatCurrency(scrapValue)} />
            <Field label="Fuel Consumption" value={`${car.fuelEconomyKmPerL} km/L`} />
            <Field label="Road Tax" value={`${formatCurrency(car.annualRoadTax)}/yr`} />
            <Field label="Insurance" value={`${formatCurrency(car.annualInsurance)}/yr`} />
            <Field label="ERP / Cashcard" value={`${formatCurrency(car.erpCashcardMonthly)}/mo`} />
            <Field label="Annual Maintenance" value={`${formatCurrency(car.annualMaintenance)}/yr`} />
          </section>

          {/* Commute & Costs */}
          <section className="rounded-md border bg-muted/30 p-4 space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wide text-foreground border-b pb-2 mb-2">
              Commute & Lifestyle
            </h4>
            <Field label="Avg. Daily Driving Time" value={`${lifestyle.driveTimeMinutesDaily} min`} />
            <Field label="Avg. Daily Public Transport Time" value={`${lifestyle.ptTimeMinutesDaily} min`} />
            <Field label="Avg. Daily Driving Distance" value={`${lifestyle.commuteDistanceKmDaily} km`} />
            <Field label="Commute Days" value={`${lifestyle.commuteDaysPerMonth}/mo`} />
            <Field label="Residential Parking" value={`${formatCurrency(lifestyle.residentialParkingMonthly)}/mo`} />
            <Field label="Work Parking" value={`${formatCurrency(lifestyle.workplaceParkingMonthly)}/mo`} />
            <Field label="Petrol" value={`$${lifestyle.petrolPricePerL.toFixed(2)}/L`} />
            <Field label="Avg. Daily Transport Cost" value={`$${lifestyle.ptDailyCost.toFixed(2)}/day`} />
          </section>

          {/* Income */}
          <section className="rounded-md border bg-muted/30 p-4 space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wide text-foreground border-b pb-2 mb-2">
              Income
            </h4>
            <Field label="Annual Total Comp" value={`${formatCurrency(compensation.annualTotalComp)}/yr`} />
            <Field label="Hours Worked/Day" value={`${compensation.hoursWorkedPerDay} hrs`} />
          </section>

          {/* Financing */}
          <section className="rounded-md border bg-muted/30 p-4 space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wide text-foreground border-b pb-2 mb-2">
              Financing
            </h4>
            <Field label="Investment Return" value={`${financing.cashInvestmentReturnPct}% p.a.`} />
            <Field label="Down Payment" value={formatCurrency(financing.loanDownPayment)} />
            <Field label="Loan Interest" value={`${financing.loanInterestRatePct}% p.a.`} />
            <Field label="Loan Tenure" value={`${financing.loanTenureMonths} months`} />
          </section>
        </div>
      </div>
    </div>
  )
}
