import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MapPin, Clock } from 'lucide-react'

export function Step2Life() {
  const { scenarios, activeScenarioId, updateLifestyle } = useScenarioStore()
  const scenario = scenarios.find(s => s.id === activeScenarioId)
  if (!scenario) return null

  const { lifestyle } = scenario
  const id = scenario.id

  function updateField(field: string, raw: string) {
    const value = raw === '' ? 0 : parseFloat(raw)
    updateLifestyle(id, { [field]: isNaN(value) ? 0 : value })
  }

  return (
    <div className="space-y-6">
      {/* Commute Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Commute Time
          </CardTitle>
          <CardDescription>
            How long does it take to get to work? Choose manual entry or auto-estimate via postal codes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Segmented control */}
          <div className="flex gap-2">
            <Button
              variant={lifestyle.commuteMode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateLifestyle(id, { commuteMode: 'manual' })}
            >
              Manual
            </Button>
            <Button
              variant={lifestyle.commuteMode === 'auto' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateLifestyle(id, { commuteMode: 'auto' })}
            >
              Auto-estimate
            </Button>
          </div>

          {lifestyle.commuteMode === 'manual' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Driving time (one-way)"
                tooltip="Your estimated drive time from home to work, in minutes."
                value={lifestyle.driveTimeMinutesOneWay || ''}
                onChange={(v) => updateField('driveTimeMinutesOneWay', v)}
                suffix="mins"
              />
              <FormField
                label="Public transport time (one-way)"
                tooltip="Your estimated MRT/bus commute time from home to work, in minutes."
                value={lifestyle.ptTimeMinutesOneWay || ''}
                onChange={(v) => updateField('ptTimeMinutesOneWay', v)}
                suffix="mins"
              />
              <FormField
                label="Commute distance (one-way)"
                tooltip="Approximate driving distance. Used to calculate fuel costs."
                value={lifestyle.commuteDistanceKm || ''}
                onChange={(v) => updateField('commuteDistanceKm', v)}
                suffix="km"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Home Postal Code"
                  type="text"
                  value={lifestyle.homePostalCode}
                  onChange={(v) => updateLifestyle(id, { homePostalCode: v })}
                  placeholder="e.g. 520123"
                />
                <FormField
                  label="Work Postal Code"
                  type="text"
                  value={lifestyle.workPostalCode}
                  onChange={(v) => updateLifestyle(id, { workPostalCode: v })}
                  placeholder="e.g. 018956"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                OneMap API integration coming soon. For now, please switch to manual mode and enter your estimated times.
              </p>
              {/* Show the derived fields so user can verify/override */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Driving time (one-way)"
                  value={lifestyle.driveTimeMinutesOneWay || ''}
                  onChange={(v) => updateField('driveTimeMinutesOneWay', v)}
                  suffix="mins"
                />
                <FormField
                  label="Public transport time (one-way)"
                  value={lifestyle.ptTimeMinutesOneWay || ''}
                  onChange={(v) => updateField('ptTimeMinutesOneWay', v)}
                  suffix="mins"
                />
                <FormField
                  label="Commute distance (one-way)"
                  value={lifestyle.commuteDistanceKm || ''}
                  onChange={(v) => updateField('commuteDistanceKm', v)}
                  suffix="km"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Work days per month"
              value={lifestyle.workDaysPerMonth || ''}
              onChange={(v) => updateField('workDaysPerMonth', v)}
              suffix="days"
            />
            <FormField
              label="WFH days per month"
              tooltip="Days you work from home. Reduces both commute costs and time value."
              value={lifestyle.wfhDaysPerMonth || ''}
              onChange={(v) => updateField('wfhDaysPerMonth', v)}
              suffix="days"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cost Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Running Costs
          </CardTitle>
          <CardDescription>
            Parking, fuel, and public transport costs. Defaults are typical Singapore values.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="HDB Season Parking"
              tooltip="Monthly HDB parking at home. Tier 1: ~$110/mo, Tier 2: $165/mo. Check HDB website for your estate."
              value={lifestyle.hdbSeasonParkingMonthly || ''}
              onChange={(v) => updateField('hdbSeasonParkingMonthly', v)}
              prefix="$"
              suffix="/mo"
            />
            <FormField
              label="Workplace Parking"
              tooltip="Monthly season parking at work. MBC entitled: ~$196/mo. Commercial: varies."
              value={lifestyle.workplaceParkingMonthly || ''}
              onChange={(v) => updateField('workplaceParkingMonthly', v)}
              prefix="$"
              suffix="/mo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Petrol price"
              tooltip="Per litre. RON95 ~$3.40/L, RON97 ~$3.92/L."
              value={lifestyle.petrolPricePerL || ''}
              onChange={(v) => updateField('petrolPricePerL', v)}
              prefix="$"
              suffix="/L"
              step={0.01}
            />
            <FormField
              label="Weekend mileage"
              tooltip="Total extra km driven on weekends per month (errands, outings, etc)."
              value={lifestyle.weekendMileageKm || ''}
              onChange={(v) => updateField('weekendMileageKm', v)}
              suffix="km/mo"
            />
          </div>

          <div className="space-y-2">
            <Label>Primary public transport mode</Label>
            <Select
              value={lifestyle.ptMode}
              onChange={(e) => updateLifestyle(id, { ptMode: e.target.value as 'mrt' | 'grab' | 'mixed' })}
            >
              <option value="mrt">MRT / Bus only</option>
              <option value="grab">Grab / Private hire only</option>
              <option value="mixed">Mixed (MRT + some Grab)</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(lifestyle.ptMode === 'mrt' || lifestyle.ptMode === 'mixed') && (
              <FormField
                label="MRT/Bus daily cost"
                tooltip="Round-trip cost per day by public transport."
                value={lifestyle.mrtDailyCost || ''}
                onChange={(v) => updateField('mrtDailyCost', v)}
                prefix="$"
                suffix="/day"
                step={0.1}
              />
            )}
            {(lifestyle.ptMode === 'grab' || lifestyle.ptMode === 'mixed') && (
              <FormField
                label="Grab cost per trip"
                tooltip="Average one-way Grab fare for your commute."
                value={lifestyle.grabCostPerTrip || ''}
                onChange={(v) => updateField('grabCostPerTrip', v)}
                prefix="$"
                suffix="/trip"
              />
            )}
            {lifestyle.ptMode === 'mixed' && (
              <FormField
                label="Grab trips per month"
                tooltip="How many days per month you take Grab instead of MRT."
                value={lifestyle.grabTripsPerMonth || ''}
                onChange={(v) => updateField('grabTripsPerMonth', v)}
                suffix="trips"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
