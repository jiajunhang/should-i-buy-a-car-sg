import type { AnalysisResult } from '@/types/scenario'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Target } from 'lucide-react'

interface Props {
  analysis: AnalysisResult
}

export function BreakEvenCallout({ analysis }: Props) {
  const { breakEvenSalary, netGapWithoutTime } = analysis

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Break-Even Salary
            </h3>
            {breakEvenSalary !== null ? (
              <>
                <p className="text-3xl font-bold mt-1">{formatCurrency(breakEvenSalary)}/yr</p>
                <p className="text-sm text-muted-foreground mt-2">
                  At this income level, the time saved by driving makes car ownership financially equivalent
                  to public transport. Above this salary, the car becomes the more rational choice.
                </p>
              </>
            ) : netGapWithoutTime >= 0 ? (
              <>
                <p className="text-xl font-bold mt-1 text-sensible">Always sensible</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Driving is cheaper than public transport even before accounting for time value.
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold mt-1 text-hard-to-justify">No break-even point</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Driving doesn't save commute time over public transport, so time value can't close the cost gap.
                  Consider whether non-financial benefits (comfort, flexibility) justify the premium.
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
