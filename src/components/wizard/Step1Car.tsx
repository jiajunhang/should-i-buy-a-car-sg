import type { Scenario } from '@/types/scenario'
import { getScrapValue, getCoeMonthsRemaining } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { formatCurrency } from '@/lib/utils'
import { Car } from 'lucide-react'

interface Props {
  scenario: Scenario
}

export function Step1Car({ scenario }: Props) {
  const { updateCar } = useScenarioStore()
  const { car } = scenario
  const id = scenario.id

  function updateNumField(field: string, raw: string) {
    const value = raw === '' ? 0 : parseFloat(raw)
    const val = isNaN(value) ? 0 : value
    updateCar(id, { [field]: val })
  }

  const coeMonths = getCoeMonthsRemaining(car)
  const scrapValue = getScrapValue(car)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Car Details
        </CardTitle>
        <CardDescription>
          Enter the car details you're considering. You can find these on the sgCarMart listing page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          label="Car Name / Model"
          type="text"
          value={car.name}
          onChange={(v) => updateCar(id, { name: v })}
          placeholder="e.g. Audi A4 2.0L B9.5"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Purchase Price"
            tooltip="Total price including COE, ARF, and all fees. On sgCarMart, this is the asking price."
            value={car.purchasePrice}
            onChange={(v) => updateNumField('purchasePrice', v)}
            prefix="$"
          />
          <FormField
            label="Annual Depreciation"
            tooltip="Shown as 'Depreciation' on sgCarMart listings. This is the biggest cost component of car ownership."
            value={car.annualDepreciation}
            onChange={(v) => updateNumField('annualDepreciation', v)}
            prefix="$"
            suffix="/yr"
          />
        </div>

        {/* COE Remaining: years + months input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="COE Remaining (Years)"
            tooltip="Years portion of COE remaining. Found on sgCarMart as 'COE Expiry'. New cars = 10 years."
            value={car.coeYears}
            onChange={(v) => updateNumField('coeYears', v)}
            suffix="years"
            min={0}
            max={10}
          />
          <FormField
            label="COE Remaining (Months)"
            tooltip="Months portion of COE remaining. E.g. if sgCarMart shows '5 years 8 months', enter 8 here."
            value={car.coeMonths}
            onChange={(v) => updateNumField('coeMonths', v)}
            suffix="months"
            min={0}
            max={11}
          />
        </div>

        {/* Derived read-only fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md bg-muted p-3 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">COE Remaining</p>
            <p className="text-sm font-semibold">{coeMonths} months</p>
          </div>
          <div className="rounded-md bg-muted p-3 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Estimated Scrap Value</p>
            <p className="text-sm font-semibold">{formatCurrency(scrapValue)}</p>
            <p className="text-xs text-muted-foreground">Derived from price - depreciation x tenure</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Fuel Economy"
            tooltip="Kilometres per litre. Found on sgCarMart as 'Fuel Consumption'. Lower = more expensive to run."
            value={car.fuelEconomyKmPerL}
            onChange={(v) => updateNumField('fuelEconomyKmPerL', v)}
            suffix="km/L"
            step={0.1}
          />
          <FormField
            label="Annual Road Tax"
            tooltip="Found on sgCarMart listing page under 'Road Tax'. Or check LTA OneMotoring."
            value={car.annualRoadTax}
            onChange={(v) => updateNumField('annualRoadTax', v)}
            prefix="$"
            suffix="/yr"
          />
        </div>

        <FormField
          label="Annual Insurance"
          tooltip="Varies by car model, driver age, NCD. Get a quote from DirectAsia, FWD, or your insurer. Typical: $2k-$5k/yr."
          value={car.annualInsurance}
          onChange={(v) => updateNumField('annualInsurance', v)}
          prefix="$"
          suffix="/yr"
        />
      </CardContent>
    </Card>
  )
}
