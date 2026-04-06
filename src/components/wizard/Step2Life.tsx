import type { Scenario, LifestyleInputs } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { MapPin, Clock, Car, TrainFront } from 'lucide-react'
import { CopyFromMenu } from './CopyFromMenu'

interface Props {
  scenario: Scenario
}

const COMMUTE_FIELDS: (keyof LifestyleInputs)[] = [
  'driveTimeMinutesDaily',
  'ptTimeMinutesDaily',
  'commuteDistanceKmDaily',
  'commuteDaysPerMonth',
  'ptDailyCost',
]

const RUNNING_COST_FIELDS: (keyof LifestyleInputs)[] = [
  'residentialParkingMonthly',
  'workplaceParkingMonthly',
  'petrolPricePerL',
  'electricityPricePerKwh',
]

export function Step2Life({ scenario }: Props) {
  const { updateLifestyle, scenarios } = useScenarioStore()
  const { lifestyle } = scenario
  const id = scenario.id

  function updateField(field: string, raw: string) {
    const value = raw === '' ? 0 : parseFloat(raw)
    updateLifestyle(id, { [field]: isNaN(value) ? 0 : value })
  }

  function copyFieldsFrom(sourceId: string, fields: (keyof LifestyleInputs)[]) {
    const src = scenarios.find(s => s.id === sourceId)
    if (!src) return
    const patch: Partial<LifestyleInputs> = {}
    for (const f of fields) {
      (patch as Record<string, unknown>)[f] = src.lifestyle[f]
    }
    updateLifestyle(id, patch)
  }

  return (
    <div className="space-y-6">
      {/* Commute Inputs */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Commute
              </CardTitle>
              <CardDescription>
                Enter your average daily commute times and distance. These are used to calculate costs and time value.
              </CardDescription>
            </div>
            <CopyFromMenu
              currentScenarioId={id}
              sectionLabel="commute"
              onCopy={(sourceId) => copyFieldsFrom(sourceId, COMMUTE_FIELDS)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Driving sub-section */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Car className="h-4 w-4" />
              Driving
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Avg. daily driving time"
                tooltip="Total time spent driving per day (both directions combined). E.g. 30 min each way = 60 min."
                value={lifestyle.driveTimeMinutesDaily}
                onChange={(v) => updateField('driveTimeMinutesDaily', v)}
                suffix="mins/day"
              />
              <FormField
                label="Avg. daily driving distance"
                tooltip="Total distance driven per day (both directions combined). Used to calculate fuel costs."
                value={lifestyle.commuteDistanceKmDaily}
                onChange={(v) => updateField('commuteDistanceKmDaily', v)}
                suffix="km/day"
              />
            </div>
          </div>

          {/* Public transport sub-section */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <TrainFront className="h-4 w-4" />
              Public Transport
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Avg. daily transport time"
                tooltip="Total time spent on public transport per day (both directions combined). E.g. 60 min each way = 120 min."
                value={lifestyle.ptTimeMinutesDaily}
                onChange={(v) => updateField('ptTimeMinutesDaily', v)}
                suffix="mins/day"
              />
              <FormField
                label="Avg. daily transport cost"
                tooltip="Your average daily cost for public transport (MRT, bus, or grab — both directions). Rough estimate is fine."
                value={lifestyle.ptDailyCost}
                onChange={(v) => updateField('ptDailyCost', v)}
                prefix="$"
                suffix="/day"
                step={0.1}
              />
            </div>
          </div>

          {/* Commute frequency */}
          <FormField
            label="Days you commute per month"
            tooltip="How many days per month you'd need to commute. Typical office worker: 21 days. Adjust for WFH, part-time, or shift work."
            value={lifestyle.commuteDaysPerMonth}
            onChange={(v) => updateField('commuteDaysPerMonth', v)}
            suffix="days"
            min={0}
            max={31}
          />
        </CardContent>
      </Card>

      {/* Cost Inputs */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Running Costs
              </CardTitle>
              <CardDescription>
                Parking and fuel costs. Defaults are typical Singapore values.
              </CardDescription>
            </div>
            <CopyFromMenu
              currentScenarioId={id}
              sectionLabel="running costs"
              onCopy={(sourceId) => copyFieldsFrom(sourceId, RUNNING_COST_FIELDS)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Residential Parking"
              tooltip="Monthly parking at home. HDB Tier 1: ~$110/mo, Tier 2: $165/mo. Condo parking may be included in maintenance fees."
              value={lifestyle.residentialParkingMonthly}
              onChange={(v) => updateField('residentialParkingMonthly', v)}
              prefix="$"
              suffix="/mo"
            />
            <FormField
              label="Workplace Parking"
              tooltip="Monthly season parking at work. Varies by location — check with your office building management."
              value={lifestyle.workplaceParkingMonthly}
              onChange={(v) => updateField('workplaceParkingMonthly', v)}
              prefix="$"
              suffix="/mo"
            />
          </div>

          {scenario.car.fuelType === 'petrol' ? (
            <FormField
              label="Petrol price"
              tooltip="Per litre. Check prevailing prices on motorist.sg."
              value={lifestyle.petrolPricePerL}
              onChange={(v) => updateField('petrolPricePerL', v)}
              prefix="$"
              suffix="/L"
              step={0.01}
            />
          ) : (
            <FormField
              label="Electricity price"
              tooltip="Per kWh. SP home charging: ~$0.33/kWh. Public chargers: $0.40-$0.60/kWh."
              value={lifestyle.electricityPricePerKwh}
              onChange={(v) => updateField('electricityPricePerKwh', v)}
              prefix="$"
              suffix="/kWh"
              step={0.01}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
