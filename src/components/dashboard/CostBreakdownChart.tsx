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
  fuel: '#3b82f6',
  financing: '#8b5cf6',
}

export function CostBreakdownChart({ carCosts, ptCosts }: Props) {
  const stackedData = [
    {
      name: 'Car',
      Depreciation: Math.round(carCosts.depreciationMonthly),
      'Road Tax': Math.round(carCosts.roadTaxMonthly),
      Insurance: Math.round(carCosts.insuranceMonthly),
      Parking: Math.round(carCosts.parkingMonthly),
      Fuel: Math.round(carCosts.fuelMonthly),
      Financing: Math.round(carCosts.financingCostMonthly),
    },
    {
      name: 'Public Transport',
      'MRT/Bus': Math.round(ptCosts.mrtBusMonthly),
      Grab: Math.round(ptCosts.grabMonthly),
    },
  ]

  const carBreakdownItems = [
    { label: 'Depreciation', value: carCosts.depreciationMonthly, color: CAR_COST_COLORS.depreciation },
    { label: 'Road Tax', value: carCosts.roadTaxMonthly, color: CAR_COST_COLORS.roadTax },
    { label: 'Insurance', value: carCosts.insuranceMonthly, color: CAR_COST_COLORS.insurance },
    { label: 'Parking', value: carCosts.parkingMonthly, color: CAR_COST_COLORS.parking },
    { label: 'Fuel', value: carCosts.fuelMonthly, color: CAR_COST_COLORS.fuel },
    { label: 'Financing Cost', value: carCosts.financingCostMonthly, color: CAR_COST_COLORS.financing },
  ]

  // Horizontal bar chart data for car breakdown
  const barData = carBreakdownItems
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .map(item => ({
      name: item.label,
      value: Math.round(item.value),
      color: item.color,
    }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Car Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={barData.length * 50 + 40}>
            <BarChart data={barData} layout="vertical" margin={{ left: 80, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Total: <span className="font-semibold text-foreground">{formatCurrency(carCosts.totalMonthly)}/mo</span>
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
              <Bar dataKey="Fuel" stackId="a" fill={CAR_COST_COLORS.fuel} />
              <Bar dataKey="Financing" stackId="a" fill={CAR_COST_COLORS.financing} />
              <Bar dataKey="MRT/Bus" stackId="a" fill="#06b6d4" />
              <Bar dataKey="Grab" stackId="a" fill="#d946ef" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
