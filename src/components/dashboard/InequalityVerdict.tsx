import { useState } from 'react'
import type { AnalysisResult } from '@/types/scenario'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  analysis: AnalysisResult
}

const VERDICT_CONFIG = {
  'sensible': {
    label: 'Financially Sensible',
    description: 'After accounting for the value of time saved, car ownership makes economic sense for you.',
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

function CostBreakdownExpander({ analysis }: { analysis: AnalysisResult }) {
  const [expanded, setExpanded] = useState(false)
  const { carCosts, ptCosts, timeValue } = analysis

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto"
      >
        {expanded ? 'Hide' : 'Show'} breakdown
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {expanded && (
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mt-3 text-xs">
          <div className="space-y-1 text-muted-foreground">
            <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Car financial costs</p>
            <p className="flex justify-between"><span>Depreciation</span><span>{formatCurrency(carCosts.depreciationMonthly)}</span></p>
            <p className="flex justify-between"><span>Road Tax</span><span>{formatCurrency(carCosts.roadTaxMonthly)}</span></p>
            <p className="flex justify-between"><span>Insurance</span><span>{formatCurrency(carCosts.insuranceMonthly)}</span></p>
            <p className="flex justify-between"><span>Parking</span><span>{formatCurrency(carCosts.parkingMonthly)}</span></p>
            <p className="flex justify-between"><span>Fuel</span><span>{formatCurrency(carCosts.fuelCommuteMonthly)}</span></p>
            <p className="flex justify-between"><span>ERP</span><span>{formatCurrency(carCosts.erpCashcardMonthly)}</span></p>
            <p className="flex justify-between"><span>Maintenance</span><span>{formatCurrency(carCosts.maintenanceMonthly)}</span></p>
            <p className="flex justify-between font-semibold text-foreground border-t pt-1"><span>Total</span><span>{formatCurrency(carCosts.totalMonthly)}/mo</span></p>
            <p className="font-medium text-foreground text-xs uppercase tracking-wide mt-2 mb-1">Car time cost</p>
            <p className="flex justify-between"><span>Commute time value</span><span>{formatCurrency(timeValue.carCommuteTimeCostMonthly)}/mo</span></p>
          </div>
          <div className="w-px bg-border" />
          <div className="space-y-1 text-muted-foreground">
            <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Public transport costs</p>
            <p className="flex justify-between"><span>Daily transport</span><span>{formatCurrency(ptCosts.ptMonthly)}</span></p>
            <p className="flex justify-between font-semibold text-foreground border-t pt-1"><span>Total</span><span>{formatCurrency(ptCosts.totalMonthly)}/mo</span></p>
            <p className="font-medium text-foreground text-xs uppercase tracking-wide mt-2 mb-1">Public transport time cost</p>
            <p className="flex justify-between"><span>Commute time value</span><span>{formatCurrency(timeValue.ptCommuteTimeCostMonthly)}/mo</span></p>
          </div>
        </div>
      )}
    </div>
  )
}

export function InequalityVerdict({ analysis }: Props) {
  const config = VERDICT_CONFIG[analysis.verdict]
  const Icon = config.icon

  const carTotalWithTime = analysis.carCosts.totalMonthly + analysis.timeValue.carCommuteTimeCostMonthly
  const ptTotalWithTime = analysis.ptCosts.totalMonthly + analysis.timeValue.ptCommuteTimeCostMonthly

  const extraCost = -analysis.netGapWithoutTime // positive = car costs more
  const netPremium = -analysis.netGapWithTime   // positive = car costs more after time savings

  const extraCostSublabel = extraCost > 0
    ? `You pay ${formatCurrency(extraCost)}/mo more to drive than to take public transport.`
    : extraCost < 0
      ? `Driving is ${formatCurrency(-extraCost)}/mo cheaper than public transport.`
      : 'Driving and public transport cost the same.'

  const netPremiumSublabel = netPremium > 0
    ? `Even after accounting for time saved, driving is still ${formatCurrency(netPremium)}/mo more expensive than public transport.`
    : netPremium < 0
      ? `After accounting for time saved, driving is actually ${formatCurrency(-netPremium)}/mo cheaper than public transport.`
      : 'After accounting for time saved, driving and public transport are equivalent.'

  return (
    <Card className={cn('border-2', config.colorClass)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Icon className="h-8 w-8 flex-shrink-0 mt-1" />
          <div className="space-y-4 flex-1">
            <div>
              <h2 className="text-2xl font-bold">{config.label}</h2>
              <p className="text-sm opacity-80">{config.description}</p>
            </div>

            {/* Inequality breakdown */}
            <div className="rounded-md bg-background/50 border p-4 text-sm space-y-3">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Car (financial + time)</p>
                  <p className="text-lg font-bold">{formatCurrency(carTotalWithTime)}<span className="text-sm font-normal">/mo</span></p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">{formatCurrency(analysis.carCosts.totalMonthly)}</span> financial
                    {' + '}
                    <span className="font-medium">{formatCurrency(analysis.timeValue.carCommuteTimeCostMonthly)}</span> time
                  </p>
                </div>
                <span className={cn(
                  'text-xl font-bold',
                  analysis.netGapWithTime >= 0 ? 'text-sensible' : 'text-hard-to-justify'
                )}>
                  {analysis.netGapWithTime >= 0 ? '≤' : '>'}
                </span>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Public transport (financial + time)</p>
                  <p className="text-lg font-bold">{formatCurrency(ptTotalWithTime)}<span className="text-sm font-normal">/mo</span></p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">{formatCurrency(analysis.ptCosts.totalMonthly)}</span> financial
                    {' + '}
                    <span className="font-medium">{formatCurrency(analysis.timeValue.ptCommuteTimeCostMonthly)}</span> time
                  </p>
                </div>
              </div>
              <CostBreakdownExpander analysis={analysis} />
            </div>

            {/* Two key numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Extra cost of driving</p>
                <p className="text-xl font-semibold">
                  {extraCost > 0 ? '+' : ''}{formatCurrency(extraCost)}/mo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {extraCostSublabel}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Net premium after time savings</p>
                <p className="text-xl font-semibold">
                  {netPremium > 0 ? '+' : ''}{formatCurrency(netPremium)}/mo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {netPremiumSublabel}
                </p>
              </div>
            </div>

            {/* Intangibles note — shown when there's a net premium */}
            {netPremium > 0 && (
              <p className="text-xs text-muted-foreground border-t pt-3">
                This {formatCurrency(netPremium)}/mo is what you'd pay for convenience, on-demand travel, driving enjoyment, and easily visiting family — things that can't be easily quantified. If those are worth it to you, the car can still be justified.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
