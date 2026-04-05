import { useState } from 'react'
import type { TimeValueResult, LifestyleInputs } from '@/types/scenario'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatCurrencyDetailed } from '@/lib/utils'
import { Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  timeValue: TimeValueResult
  lifestyle: LifestyleInputs
}

function ExpandableRow({
  label,
  value,
  valueClass,
  details,
}: {
  label: string
  value: string
  valueClass?: string
  details?: string[]
}) {
  const [expanded, setExpanded] = useState(false)
  const hasDetail = details && details.length > 0

  return (
    <div>
      <div
        className={cn('flex justify-between text-sm', hasDetail && 'cursor-pointer hover:bg-muted/80 -mx-2 px-2 py-0.5 rounded')}
        onClick={() => hasDetail && setExpanded(!expanded)}
      >
        <span className="flex items-center gap-1">
          {label}
          {hasDetail && (
            expanded
              ? <ChevronUp className="h-3 w-3 text-muted-foreground" />
              : <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )}
        </span>
        <span className={cn('font-medium', valueClass)}>{value}</span>
      </div>
      {expanded && details && (
        <div className="text-xs text-muted-foreground bg-background/50 border rounded-md p-2 mt-1 mb-1 ml-2 space-y-0.5">
          {details.map((line, i) => <p key={i}>{line}</p>)}
        </div>
      )}
    </div>
  )
}

export function TimeValuePanel({ timeValue, lifestyle }: Props) {
  const timeSavedPerDay = lifestyle.ptTimeMinutesDaily - lifestyle.driveTimeMinutesDaily
  const commuteDays = lifestyle.commuteDaysPerMonth

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Value Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Per hour</p>
            <p className="text-lg font-semibold">{formatCurrencyDetailed(timeValue.costPerHour)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Per minute</p>
            <p className="text-lg font-semibold">{formatCurrencyDetailed(timeValue.costPerMinute)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Saved/day</p>
            <p className="text-lg font-semibold">{timeSavedPerDay > 0 ? '+' : ''}{timeSavedPerDay} min</p>
          </div>
        </div>

        <div className="rounded-md bg-muted p-4 space-y-2">
          <ExpandableRow
            label="Monthly commute time cost (car)"
            value={formatCurrency(timeValue.carCommuteTimeCostMonthly)}
            details={[
              `= ${lifestyle.driveTimeMinutesDaily} min/day × ${commuteDays} days × ${formatCurrencyDetailed(timeValue.costPerMinute)}/min`,
              `= ${formatCurrencyDetailed(timeValue.carCommuteTimeCostMonthly)}/mo`,
            ]}
          />
          <ExpandableRow
            label="Monthly commute time cost (public transport)"
            value={formatCurrency(timeValue.ptCommuteTimeCostMonthly)}
            details={[
              `= ${lifestyle.ptTimeMinutesDaily} min/day × ${commuteDays} days × ${formatCurrencyDetailed(timeValue.costPerMinute)}/min`,
              `= ${formatCurrencyDetailed(timeValue.ptCommuteTimeCostMonthly)}/mo`,
            ]}
          />
          <ExpandableRow
            label="Monthly time value of driving"
            value={`${timeValue.timeSavingsValueMonthly > 0 ? '+' : ''}${formatCurrency(timeValue.timeSavingsValueMonthly)}`}
            valueClass={timeValue.timeSavingsValueMonthly > 0 ? 'text-sensible' : 'text-hard-to-justify'}
            details={[
              `= Time saved per day × commute days × cost per minute`,
              `= ${timeSavedPerDay} min × ${commuteDays} days × ${formatCurrencyDetailed(timeValue.costPerMinute)}/min`,
              `= ${formatCurrencyDetailed(timeValue.timeSavingsValueMonthly)}/mo`,
            ]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
