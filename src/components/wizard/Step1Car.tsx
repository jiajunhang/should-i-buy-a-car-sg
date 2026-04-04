import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { computeScrapValue, computeAnnualDepreciation } from '@/computation/carCosts'
import { Car } from 'lucide-react'

export function Step1Car() {
  const { scenarios, activeScenarioId, updateCar } = useScenarioStore()
  const scenario = scenarios.find(s => s.id === activeScenarioId)
  if (!scenario) return null

  const { car } = scenario
  const id = scenario.id

  function updateNumField(field: string, raw: string) {
    const value = raw === '' ? 0 : parseFloat(raw)
    const val = isNaN(value) ? 0 : value
    const updates: Record<string, number> = { [field]: val }

    // Bi-directional auto-fill: depreciation ↔ scrap value
    const currentCar = { ...car, [field]: val }
    if (field === 'annualDepreciation' || field === 'purchasePrice' || field === 'coeMonthsRemaining') {
      if (currentCar.annualDepreciation > 0 && currentCar.coeMonthsRemaining > 0) {
        updates.scrapValue = Math.max(0, computeScrapValue(currentCar))
      }
    } else if (field === 'scrapValue') {
      if (currentCar.coeMonthsRemaining > 0) {
        updates.annualDepreciation = Math.max(0, Math.round(computeAnnualDepreciation(currentCar)))
      }
    }

    updateCar(id, updates)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Your Car
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Scrap / PARF Value"
            tooltip="Auto-computed from purchase price, depreciation, and COE tenure. Override if you know the exact value."
            value={car.scrapValue}
            onChange={(v) => updateNumField('scrapValue', v)}
            prefix="$"
          />
          <FormField
            label="COE Months Remaining"
            tooltip="Months left on the COE. Found on sgCarMart as 'COE Expiry Date'. New cars = 120 months."
            value={car.coeMonthsRemaining}
            onChange={(v) => updateNumField('coeMonthsRemaining', v)}
            suffix="months"
            min={1}
            max={120}
          />
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
          tooltip="Varies by car model, driver age, NCD. Get a quote from DirectAsia, FWD, or your insurer. Typical: $2k–$5k/yr."
          value={car.annualInsurance}
          onChange={(v) => updateNumField('annualInsurance', v)}
          prefix="$"
          suffix="/yr"
        />
      </CardContent>
    </Card>
  )
}
