import type { TimeValueResult } from '@/types/scenario'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatCurrencyDetailed } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface Props {
  timeValue: TimeValueResult
  lifestyle: { driveTimeMinutesOneWay: number; ptTimeMinutesOneWay: number }
}

export function TimeValuePanel({ timeValue, lifestyle }: Props) {
  const timeSavedPerDay = (lifestyle.ptTimeMinutesOneWay - lifestyle.driveTimeMinutesOneWay) * 2

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Value Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Your time is worth</p>
            <p className="text-xl font-semibold">{formatCurrencyDetailed(timeValue.costPerMinute)}/min</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Time saved per day</p>
            <p className="text-xl font-semibold">{timeSavedPerDay > 0 ? '+' : ''}{timeSavedPerDay} mins</p>
          </div>
        </div>

        <div className="rounded-md bg-muted p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Monthly commute time cost (car)</span>
            <span className="font-medium">{formatCurrency(timeValue.carCommuteTimeCostMonthly)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Monthly commute time cost (PT)</span>
            <span className="font-medium">{formatCurrency(timeValue.ptCommuteTimeCostMonthly)}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2 font-semibold">
            <span>Monthly time value of driving</span>
            <span className={timeValue.timeSavingsValueMonthly > 0 ? 'text-sensible' : 'text-hard-to-justify'}>
              {timeValue.timeSavingsValueMonthly > 0 ? '+' : ''}{formatCurrency(timeValue.timeSavingsValueMonthly)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
