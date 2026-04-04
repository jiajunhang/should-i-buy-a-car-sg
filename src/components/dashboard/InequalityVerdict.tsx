import type { AnalysisResult } from '@/types/scenario'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface Props {
  analysis: AnalysisResult
}

const VERDICT_CONFIG = {
  'sensible': {
    label: 'Financially Sensible',
    description: 'When accounting for time value, car ownership makes economic sense at your income level.',
    icon: CheckCircle,
    colorClass: 'text-sensible border-sensible/30 bg-sensible/5',
  },
  'borderline': {
    label: 'Borderline',
    description: 'The numbers are close. Small changes in salary, commute, or costs could tip the balance.',
    icon: AlertTriangle,
    colorClass: 'text-borderline border-borderline/30 bg-borderline/5',
  },
  'hard-to-justify': {
    label: 'Hard to Justify',
    description: 'Car ownership costs significantly more than public transport, even after accounting for time value.',
    icon: XCircle,
    colorClass: 'text-hard-to-justify border-hard-to-justify/30 bg-hard-to-justify/5',
  },
} as const

export function InequalityVerdict({ analysis }: Props) {
  const config = VERDICT_CONFIG[analysis.verdict]
  const Icon = config.icon

  return (
    <Card className={cn('border-2', config.colorClass)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Icon className="h-8 w-8 flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{config.label}</h2>
            <p className="text-sm opacity-80">{config.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-current/10">
              <div>
                <p className="text-xs opacity-60 uppercase tracking-wide">Monthly gap (without time)</p>
                <p className="text-xl font-semibold">{formatCurrency(analysis.netGapWithoutTime)}/mo</p>
              </div>
              <div>
                <p className="text-xs opacity-60 uppercase tracking-wide">Monthly gap (with time value)</p>
                <p className="text-xl font-semibold">{formatCurrency(analysis.netGapWithTime)}/mo</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
