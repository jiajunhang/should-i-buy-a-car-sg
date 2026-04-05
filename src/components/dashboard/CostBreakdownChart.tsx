import type { CarCostBreakdown, PTCostBreakdown } from '@/types/scenario'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, Scale } from 'lucide-react'

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
}

export function CostBreakdownChart({ carCosts, ptCosts }: Props) {
  const stackedData = [
    {
      name: 'Car',
      Depreciation: Math.round(carCosts.depreciationMonthly),
      'Road Tax': Math.round(carCosts.roadTaxMonthly),
      Insurance: Math.round(carCosts.insuranceMonthly),
      Parking: Math.round(carCosts.parkingMonthly),
      Fuel: Math.round(carCosts.fuelCommuteMonthly),
    },
    {
      name: 'Public Transport',
      'Transport': Math.round(ptCosts.ptMonthly),
    },
  ]

  const barData = [
    { name: 'Depreciation', value: Math.round(carCosts.depreciationMonthly), color: CAR_COST_COLORS.depreciation },
    { name: 'Road Tax', value: Math.round(carCosts.roadTaxMonthly), color: CAR_COST_COLORS.roadTax },
    { name: 'Insurance', value: Math.round(carCosts.insuranceMonthly), color: CAR_COST_COLORS.insurance },
    { name: 'Parking', value: Math.round(carCosts.parkingMonthly), color: CAR_COST_COLORS.parking },
    { name: 'Fuel', value: Math.round(carCosts.fuelCommuteMonthly), color: CAR_COST_COLORS.fuelCommute },
  ]
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monthly Car Cost Breakdown
          </CardTitle>
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
          <p className="mt-4 text-sm text-center">
            Total: <span className="font-semibold text-foreground">{formatCurrency(carCosts.totalMonthly)}/mo</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Car vs Public Transport
          </CardTitle>
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
              <Bar dataKey="Fuel" stackId="a" fill={CAR_COST_COLORS.fuelCommute} />
              <Bar dataKey="Transport" stackId="a" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
