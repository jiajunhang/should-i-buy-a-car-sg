import { useState, useRef, useEffect } from 'react'
import { useScenarioStore } from '@/store/scenarioStore'
import { Copy, Check } from 'lucide-react'

interface Props {
  currentScenarioId: string
  /** Human label for what gets copied, e.g. "commute" */
  sectionLabel: string
  /** Called with the source scenario's id once the user picks it */
  onCopy: (sourceScenarioId: string) => void
}

/**
 * Small inline "Copy from: [Scenario ▾]" menu shown at the top of
 * reusable wizard sections when there is more than one scenario.
 * One-shot copy; no binding or sync.
 */
export function CopyFromMenu({ currentScenarioId, sectionLabel, onCopy }: Props) {
  const scenarios = useScenarioStore(s => s.scenarios)
  const others = scenarios.filter(s => s.id !== currentScenarioId)
  const [open, setOpen] = useState(false)
  const [justCopied, setJustCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  if (others.length === 0) return null

  function handlePick(sourceId: string) {
    onCopy(sourceId)
    setOpen(false)
    setJustCopied(true)
    setTimeout(() => setJustCopied(false), 1500)
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {justCopied ? (
          <>
            <Check className="h-3.5 w-3.5 text-primary" />
            <span className="text-primary">Copied {sectionLabel}</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy {sectionLabel} from…</span>
          </>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 min-w-[180px] rounded-md border bg-popover shadow-md z-10 py-1">
          {others.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handlePick(s.id)}
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-accent truncate"
            >
              {s.name || 'Untitled'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
