import { useState } from 'react'
import type { Scenario, CarInputs } from '@/types/scenario'
import { getScrapValue, getCoeMonthsRemaining } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Car, Info, Link2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'

type FetchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; missing: string[] }
  | { kind: 'error'; message: string }

const MISSING_LABELS: Record<string, string> = {
  name: 'Car name',
  purchasePrice: 'Purchase price',
  annualDepreciation: 'Annual depreciation',
  coeYears: 'COE remaining',
  annualRoadTax: 'Road tax',
  fuelType: 'Fuel type',
}

interface Props {
  scenario: Scenario
}

export function Step1Car({ scenario }: Props) {
  const { updateCar } = useScenarioStore()
  const { car } = scenario
  const id = scenario.id

  const [url, setUrl] = useState('')
  const [fetchState, setFetchState] = useState<FetchState>({ kind: 'idle' })

  function updateNumField(field: string, raw: string) {
    const value = raw === '' ? 0 : parseFloat(raw)
    const val = isNaN(value) ? 0 : value
    updateCar(id, { [field]: val })
  }

  async function handleFetch() {
    const trimmed = url.trim()
    if (!trimmed) return
    if (!/^https:\/\/www\.sgcarmart\.com\/used-cars\/info\/[^/?#]*-\d{5,}(\/|\?|$)/.test(trimmed)) {
      setFetchState({ kind: 'error', message: 'Please paste a full SGCarMart used-car listing URL (e.g. https://www.sgcarmart.com/used-cars/info/tesla-model-3-electric-1482969).' })
      return
    }
    setFetchState({ kind: 'loading' })
    try {
      const res = await fetch(`/api/sgcarmart?url=${encodeURIComponent(trimmed)}`)
      const body = await res.json()
      if (!res.ok) {
        setFetchState({ kind: 'error', message: body.error ?? `Request failed (${res.status}).` })
        return
      }
      const d = body.data as Partial<Record<keyof CarInputs | 'coeYears' | 'coeMonths', unknown>>
      const patch: Partial<CarInputs> = {}
      if (typeof d.name === 'string') patch.name = d.name
      if (typeof d.purchasePrice === 'number') patch.purchasePrice = d.purchasePrice
      if (typeof d.annualDepreciation === 'number') patch.annualDepreciation = d.annualDepreciation
      if (typeof d.coeYears === 'number') patch.coeYears = d.coeYears
      if (typeof d.coeMonths === 'number') patch.coeMonths = d.coeMonths
      if (typeof d.annualRoadTax === 'number') patch.annualRoadTax = d.annualRoadTax
      if (d.fuelType === 'petrol' || d.fuelType === 'ev') patch.fuelType = d.fuelType
      updateCar(id, patch)
      setFetchState({ kind: 'success', missing: body.missing ?? [] })
    } catch (e) {
      setFetchState({ kind: 'error', message: 'Network error. Please try again or enter details manually.' })
    }
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
        {/* Auto-fetch from SGCarMart */}
        <div className="rounded-lg border border-dashed bg-muted/30 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Link2 className="h-4 w-4" />
            Auto-fill from SGCarMart (used car listings only)
          </div>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Paste a sgCarMart listing listing URL."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleFetch() } }}
              disabled={fetchState.kind === 'loading'}
              className="flex-1 h-9 text-sm"
            />
            <Button
              type="button"
              onClick={handleFetch}
              disabled={fetchState.kind === 'loading' || !url.trim()}
              size="sm"
            >
              {fetchState.kind === 'loading' ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Fetching</>
              ) : (
                'Fetch'
              )}
            </Button>
          </div>
          {fetchState.kind === 'error' && (
            <div className="flex items-start gap-2 text-xs text-hard-to-justify">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{fetchState.message}</span>
            </div>
          )}
          {fetchState.kind === 'success' && (
            <div className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-primary" />
              {fetchState.missing.length === 0 ? (
                <span className="text-muted-foreground">All fields auto-filled. Please review below.</span>
              ) : (
                <span className="text-muted-foreground">
                  Auto-filled. Please fill in manually:{' '}
                  <span className="font-medium text-foreground">
                    {fetchState.missing.map(k => MISSING_LABELS[k] ?? k).join(', ')}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

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

        {/* Fuel type toggle */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label>Fuel Type</Label>
            <Tooltip content="Select whether this car runs on petrol or electricity. This determines how energy costs are calculated.">
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => updateCar(id, { fuelType: 'petrol' })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                car.fuelType === 'petrol'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Petrol
            </button>
            <button
              onClick={() => updateCar(id, { fuelType: 'ev' })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                car.fuelType === 'ev'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Electric (EV)
            </button>
          </div>
        </div>

        <FormField
          label="Annual Road Tax"
          tooltip="Found on sgCarMart listing page under 'Road Tax'. Or check LTA OneMotoring. Typical range: $500-$1,500/yr for most cars."
          value={car.annualRoadTax}
          onChange={(v) => updateNumField('annualRoadTax', v)}
          prefix="$"
          suffix="/yr"
        />

        {/* Manual-only section — these fields are never listed on sgCarMart. */}
        <div
          className={`rounded-lg border p-4 space-y-4 transition-colors ${
            fetchState.kind === 'success'
              ? 'border-primary/40 bg-primary/5'
              : 'border-dashed bg-muted/20'
          }`}
        >
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {fetchState.kind === 'success'
                ? 'These fields are never listed on sgCarMart — please review and adjust if you have better estimates. Defaults are loose Singapore averages.'
                : 'These fields are never listed on sgCarMart. Defaults are loose Singapore averages — adjust if you have better estimates.'}
            </p>
          </div>

          {car.fuelType === 'petrol' ? (
            <FormField
              label="Fuel Consumption"
              tooltip="Kilometres per litre. sgCarMart may show this in the description, or estimate based on engine size. 12-14 km/L is typical for most sedans."
              value={car.fuelEconomyKmPerL}
              onChange={(v) => updateNumField('fuelEconomyKmPerL', v)}
              suffix="km/L"
              step={0.1}
            />
          ) : (
            <FormField
              label="Energy Efficiency"
              tooltip="Kilometres per kWh. Most EVs in Singapore achieve 5-7 km/kWh. Check your car's dashboard or specs."
              value={car.evEfficiencyKmPerKwh}
              onChange={(v) => updateNumField('evEfficiencyKmPerKwh', v)}
              suffix="km/kWh"
              step={0.1}
            />
          )}

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
        </div>
      </CardContent>
    </Card>
  )
}
