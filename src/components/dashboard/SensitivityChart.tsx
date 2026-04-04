import { useMemo } from 'react'
import type { Scenario } from '@/types/scenario'
import { computeCarCosts } from '@/computation/carCosts'
import { computePTCosts } from '@/computation/ptCosts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface Props {
  scenario: Scenario
}

export function SensitivityChart({ scenario }: Props) {
  const data = useMemo(() => {
    const carCosts = computeCarCosts(scenario.car, scenario.lifestyle, scenario.financing)
    const ptCosts = computePTCosts(scenario.lifestyle)
    const commuteDays = scenario.lifestyle.workDaysPerMonth - scenario.lifestyle.wfhDaysPerMonth
    const timeDiffMin = (scenario.lifestyle.ptTimeMinutesOneWay - scenario.lifestyle.driveTimeMinutesOneWay) * 2

    const points = []
    for (let salary = 50000; salary <= 500000; salary += 10000) {
      const costPerMin = salary / (12 * 21 * 9 * 60)
      const timeSavingsValue = timeDiffMin * commuteDays * costPerMin
      const netGap = ptCosts.totalMonthly - carCosts.totalMonthly + timeSavingsValue

      points.push({
        salary: salary / 1000,
        gap: Math.round(netGap),
      })
    }
    return points
  }, [scenario])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensitivity: Annual Salary vs Monthly Gap</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="salary"
              tickFormatter={(v) => `$${v}k`}
              label={{ value: 'Annual Salary ($k)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              tickFormatter={(v) => `$${v}`}
              label={{ value: 'Monthly Gap ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)) + '/mo', 'Net Gap']}
              labelFormatter={(v) => `Salary: $${v}k/yr`}
            />
            <ReferenceLine y={0} stroke="#888" strokeDasharray="4 4" label="Break-even" />
            <Line
              type="monotone"
              dataKey="gap"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Above the zero line = car ownership is financially sensible. Below = public transport wins.
        </p>
      </CardContent>
    </Card>
  )
}
