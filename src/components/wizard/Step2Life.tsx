import type { Scenario } from '@/types/scenario'
import { useScenarioStore } from '@/store/scenarioStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { MapPin, Clock, Car, TrainFront, Calendar } from 'lucide-react'

interface Props {
  scenario: Scenario
}

export function Step2Life({ scenario }: Props) {
  const { updateLifestyle } = useScenarioStore()
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
            Enter your estimated commute times. These are used to calculate the time-value comparison.
          </CardDescription>
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
                label="Drive time (one-way)"
                tooltip="Your estimated drive time from home to work, in minutes."
                value={lifestyle.driveTimeMinutesOneWay}
                onChange={(v) => updateField('driveTimeMinutesOneWay', v)}
                suffix="mins"
              />
              <FormField
                label="Driving distance (one-way)"
                tooltip="Approximate driving distance from home to work. Used to calculate fuel costs."
                value={lifestyle.commuteDistanceKm}
                onChange={(v) => updateField('commuteDistanceKm', v)}
                suffix="km"
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
                label="Transport time (one-way)"
                tooltip="Your estimated MRT/bus/grab commute time from home to work, in minutes."
                value={lifestyle.ptTimeMinutesOneWay}
                onChange={(v) => updateField('ptTimeMinutesOneWay', v)}
                suffix="mins"
              />
              <FormField
                label="Average daily transport cost"
                tooltip="Your average round-trip cost by public transport (MRT, bus, or grab). Put in a rough estimate — it doesn't need to be exact."
                value={lifestyle.ptDailyCost}
                onChange={(v) => updateField('ptDailyCost', v)}
                prefix="$"
                suffix="/day"
                step={0.1}
              />
            </div>
          </div>

          {/* Work schedule */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Work Schedule
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Work days per month"
                tooltip="Used to compute monthly commute costs and time value. Typical: 21-22 days."
                value={lifestyle.workDaysPerMonth}
                onChange={(v) => updateField('workDaysPerMonth', v)}
                suffix="days"
              />
              <FormField
                label="WFH days per month"
                tooltip="Days you work from home. Reduces both commute costs and time value."
                value={lifestyle.wfhDaysPerMonth}
                onChange={(v) => updateField('wfhDaysPerMonth', v)}
                suffix="days"
              />
            </div>
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
            Parking, fuel, and weekend driving costs. Defaults are typical Singapore values.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="HDB Season Parking"
              tooltip="Monthly HDB parking at home. Tier 1: ~$110/mo, Tier 2: $165/mo. Check HDB website for your estate."
              value={lifestyle.hdbSeasonParkingMonthly}
              onChange={(v) => updateField('hdbSeasonParkingMonthly', v)}
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

          <FormField
            label="Petrol price"
            tooltip="Per litre. Check prevailing prices on motorist.sg."
            value={lifestyle.petrolPricePerL}
            onChange={(v) => updateField('petrolPricePerL', v)}
            prefix="$"
            suffix="/L"
            step={0.01}
          />
        </CardContent>
      </Card>
    </div>
  )
}
