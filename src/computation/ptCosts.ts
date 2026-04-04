import type { LifestyleInputs, PTCostBreakdown } from '@/types/scenario'

export function computePTCosts(lifestyle: LifestyleInputs): PTCostBreakdown {
  const commuteDays = lifestyle.workDaysPerMonth - lifestyle.wfhDaysPerMonth

  let mrtBusMonthly = 0
  let grabMonthly = 0

  switch (lifestyle.ptMode) {
    case 'mrt':
      mrtBusMonthly = lifestyle.mrtDailyCost * commuteDays
      break
    case 'grab':
      grabMonthly = lifestyle.grabCostPerTrip * commuteDays
      break
    case 'mixed':
      // User specifies how many Grab trips; rest are MRT
      grabMonthly = lifestyle.grabCostPerTrip * lifestyle.grabTripsPerMonth
      const mrtDays = Math.max(0, commuteDays - lifestyle.grabTripsPerMonth)
      mrtBusMonthly = lifestyle.mrtDailyCost * mrtDays
      break
  }

  return {
    mrtBusMonthly,
    grabMonthly,
    totalMonthly: mrtBusMonthly + grabMonthly,
  }
}
