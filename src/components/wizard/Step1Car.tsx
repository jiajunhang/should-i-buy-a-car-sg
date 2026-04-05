import type { Scenario } from '@/types/scenario'
import { getScrapValue, getCoeMonthsRemaining } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { Car, Info } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'

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
          Enter the car details you're considering. You can find these on{' '}
          <a
            href="https://www.sgcarmart.com/used-cars"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-primary hover:text-primary/80"
          >
            sgCarMart
          </a>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          label="Car Name / Model"
          type="text"
          value={car.name}
          onChange={(v) => updateCar(id, { name: v })}
          tooltip="Used to label your scenario tab. Has no effect on calculations."
          placeholder="e.g. Honda Civic 1.6L"
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

        {/* COE Remaining: dropdown selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label>COE Remaining (Years)</Label>
              <Tooltip content="Years portion of COE remaining. Found on sgCarMart as 'COE Expiry'. New cars = 10 years.">
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <Select
              value={car.coeYears}
              onChange={(e) => updateCar(id, { coeYears: parseInt(e.target.value) })}
            >
              {Array.from({ length: 11 }, (_, i) => (
                <option key={i} value={i}>{i} {i === 1 ? 'year' : 'years'}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label>COE Remaining (Months)</Label>
              <Tooltip content="Months portion of COE remaining. E.g. if sgCarMart shows '5 years 8 months', enter 8 here.">
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <Select
              value={car.coeMonths}
              onChange={(e) => updateCar(id, { coeMonths: parseInt(e.target.value) })}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{i} {i === 1 ? 'month' : 'months'}</option>
              ))}
            </Select>
          </div>
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
            label="Fuel Consumption"
            tooltip="Kilometres per litre. sgCarMart may show this in the description, or estimate based on engine size. 12-14 km/L is typical for most sedans."
            value={car.fuelEconomyKmPerL}
            onChange={(v) => updateNumField('fuelEconomyKmPerL', v)}
            suffix="km/L"
            step={0.1}
          />
          <FormField
            label="Annual Road Tax"
            tooltip="Found on sgCarMart listing page under 'Road Tax'. Or check LTA OneMotoring. Typical range: $500-$1,500/yr for most cars."
            value={car.annualRoadTax}
            onChange={(v) => updateNumField('annualRoadTax', v)}
            prefix="$"
            suffix="/yr"
          />
        </div>

        <FormField
          label="Annual Insurance"
          tooltip="Varies by car model, driver age, and NCD. Get a quote from FWD, DirectAsia, or your insurer. New drivers without NCD typically pay $3k-$4k. Experienced drivers (50% NCD) may pay $1k-$2k."
          value={car.annualInsurance}
          onChange={(v) => updateNumField('annualInsurance', v)}
          prefix="$"
          suffix="/yr"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="ERP / Cashcard"
            tooltip="Monthly estimate for ERP charges and cashcard top-ups. Depends on your route — $30-$80/mo is typical."
            value={car.erpCashcardMonthly}
            onChange={(v) => updateNumField('erpCashcardMonthly', v)}
            prefix="$"
            suffix="/mo"
          />
          <FormField
            label="Annual Maintenance"
            tooltip="Yearly estimate for servicing, tyres, and misc repairs. Budget ~$1,000-$1,800/yr depending on car age and mileage."
            value={car.annualMaintenance}
            onChange={(v) => updateNumField('annualMaintenance', v)}
            prefix="$"
            suffix="/yr"
          />
        </div>
      </CardContent>
    </Card>
  )
}
