import { useScenarioStore } from '@/store/scenarioStore'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScenarioTabs() {
  const { scenarios, activeScenarioId, setActiveScenario, createScenario, deleteScenario } = useScenarioStore()

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {scenarios.map(s => (
        <div
          key={s.id}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors group',
            s.id === activeScenarioId
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          )}
          onClick={() => setActiveScenario(s.id)}
        >
          <span className="truncate max-w-[120px]">{s.name || 'New Car'}</span>
          <button
            onClick={(e) => { e.stopPropagation(); deleteScenario(s.id) }}
            className="p-0.5 hover:bg-white/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => createScenario()}
        className="flex-shrink-0"
      >
        <Plus className="h-4 w-4 mr-1" />
        New
      </Button>
    </div>
  )
}
