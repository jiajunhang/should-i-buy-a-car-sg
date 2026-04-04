import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { estimateRoadTax } from '@/computation/defaults'
import { Car } from 'lucide-react'

export function Step1Car() {
  const { scenarios, activeScenarioId, updateCar } = useScenarioStore()
  const scenario = scenarios.find(s => s.id === activeScenarioId)
  if (!scenario) return null

  const { car } = scenario
  const id = scenario.id

  function updateField(field: string, raw: string) {
    const value = raw === '' ? 0 : parseFloat(raw)
    const updates: Record<string, unknown> = { [field]: isNaN(value) ? 0 : value }

    // Auto-update road tax when engine CC changes
    if (field === 'engineCC' && !isNaN(value) && value > 0) {
      updates.annualRoadTax = Math.round(estimateRoadTax(value))
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
          Enter the car details you're considering. You can find these on sgCarMart listing pages.
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
            value={car.purchasePrice || ''}
            onChange={(v) => updateField('purchasePrice', v)}
            prefix="$"
          />
          <FormField
            label="Scrap / PARF Value"
            tooltip="The value you'll receive when deregistering the car. On sgCarMart, check 'PARF Rebate' or 'Scrap Value' on the listing."
            value={car.scrapValue || ''}
            onChange={(v) => updateField('scrapValue', v)}
            prefix="$"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="COE Tenure Remaining"
            tooltip="Years left on the COE. New cars = 10 years. Used cars = check registration date."
            value={car.coeTenureYears || ''}
            onChange={(v) => updateField('coeTenureYears', v)}
            suffix="years"
            min={1}
            max={10}
          />
          <FormField
            label="Engine Displacement"
            tooltip="Engine size in CC. Affects road tax calculation. Found on sgCarMart under 'Engine Cap.'"
            value={car.engineCC || ''}
            onChange={(v) => updateField('engineCC', v)}
            suffix="cc"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Fuel Economy"
            tooltip="Kilometres per litre. Found on sgCarMart as 'Fuel Consumption'. Lower = more expensive to run."
            value={car.fuelEconomyKmPerL || ''}
            onChange={(v) => updateField('fuelEconomyKmPerL', v)}
            suffix="km/L"
            step={0.1}
          />
          <FormField
            label="Annual Road Tax"
            tooltip="Auto-estimated from engine CC. Override if you know the exact amount from LTA OneMotoring."
            value={car.annualRoadTax || ''}
            onChange={(v) => updateField('annualRoadTax', v)}
            prefix="$"
            suffix="/yr"
          />
        </div>

        <FormField
          label="Annual Insurance"
          tooltip="Varies by car model, driver age, NCD. Get a quote from DirectAsia, FWD, or your insurer. Typical: $2k–$5k/yr."
          value={car.annualInsurance || ''}
          onChange={(v) => updateField('annualInsurance', v)}
          prefix="$"
          suffix="/yr"
        />
      </CardContent>
    </Card>
  )
}
