import type { CarCostBreakdown, PTCostBreakdown } from '@/types/scenario'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface Props {
  carCosts: CarCostBreakdown
  ptCosts: PTCostBreakdown
}

const CAR_COST_COLORS = {
  depreciation: '#ef4444',
  roadTax: '#f97316',
  insurance: '#eab308',
  parking: '#22c55e',
  fuelCommute: '#3b82f6',
  fuelWeekend: '#93c5fd',
}

export function CostBreakdownChart({ carCosts, ptCosts }: Props) {
  const stackedData = [
    {
      name: 'Car (commute)',
      Depreciation: Math.round(carCosts.depreciationMonthly),
      'Road Tax': Math.round(carCosts.roadTaxMonthly),
      Insurance: Math.round(carCosts.insuranceMonthly),
      Parking: Math.round(carCosts.parkingMonthly),
      'Fuel (commute)': Math.round(carCosts.fuelCommuteMonthly),
    },
    {
      name: 'Public Transport',
      'MRT/Bus': Math.round(ptCosts.mrtBusMonthly),
      Grab: Math.round(ptCosts.grabMonthly),
    },
  ]

  const barData = [
    { name: 'Depreciation', value: Math.round(carCosts.depreciationMonthly), color: CAR_COST_COLORS.depreciation },
    { name: 'Road Tax', value: Math.round(carCosts.roadTaxMonthly), color: CAR_COST_COLORS.roadTax },
    { name: 'Insurance', value: Math.round(carCosts.insuranceMonthly), color: CAR_COST_COLORS.insurance },
    { name: 'Parking', value: Math.round(carCosts.parkingMonthly), color: CAR_COST_COLORS.parking },
    { name: 'Fuel (commute)', value: Math.round(carCosts.fuelCommuteMonthly), color: CAR_COST_COLORS.fuelCommute },
    { name: 'Fuel (weekend)', value: Math.round(carCosts.fuelWeekendMonthly), color: CAR_COST_COLORS.fuelWeekend },
  ]
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Car Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={barData.length * 50 + 40}>
            <BarChart data={barData} layout="vertical" margin={{ left: 100, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-col gap-1 text-sm text-center">
            <p>
              Commute costs: <span className="font-semibold text-foreground">{formatCurrency(carCosts.totalCommuteMonthly)}/mo</span>
              <span className="text-muted-foreground text-xs ml-1">(used in comparison)</span>
            </p>
            {carCosts.fuelWeekendMonthly > 0 && (
              <p className="text-muted-foreground text-xs">
                + Weekend fuel: {formatCurrency(carCosts.fuelWeekendMonthly)}/mo
                = Total ownership: {formatCurrency(carCosts.totalOwnershipMonthly)}/mo
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Car vs Public Transport</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stackedData} margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="Depreciation" stackId="a" fill={CAR_COST_COLORS.depreciation} />
              <Bar dataKey="Road Tax" stackId="a" fill={CAR_COST_COLORS.roadTax} />
              <Bar dataKey="Insurance" stackId="a" fill={CAR_COST_COLORS.insurance} />
              <Bar dataKey="Parking" stackId="a" fill={CAR_COST_COLORS.parking} />
              <Bar dataKey="Fuel (commute)" stackId="a" fill={CAR_COST_COLORS.fuelCommute} />
              <Bar dataKey="MRT/Bus" stackId="a" fill="#06b6d4" />
              <Bar dataKey="Grab" stackId="a" fill="#d946ef" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
