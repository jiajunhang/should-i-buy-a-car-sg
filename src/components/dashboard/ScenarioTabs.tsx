import { useState, useRef, useEffect } from 'react'
import { useScenarioStore } from '@/store/scenarioStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScenarioTabs() {
  const { scenarios, activeScenarioId, setActiveScenario, createScenario, duplicateScenario, deleteScenario, renameScenario } = useScenarioStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  function startRename(id: string, currentName: string) {
    setEditingId(id)
    setEditValue(currentName)
  }

  function commitRename() {
    if (editingId && editValue.trim()) {
      renameScenario(editingId, editValue.trim())
    }
    setEditingId(null)
  }

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
          onDoubleClick={() => startRename(s.id, s.name)}
        >
          {editingId === s.id ? (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') setEditingId(null)
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-6 w-28 text-xs px-1 bg-transparent border-white/30"
            />
          ) : (
            <span className="truncate max-w-[120px]">{s.name || 'Untitled'}</span>
          )}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); duplicateScenario(s.id) }}
              className="p-0.5 hover:bg-white/20 rounded"
              title="Duplicate"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteScenario(s.id) }}
              className="p-0.5 hover:bg-white/20 rounded"
              title="Delete"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
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
