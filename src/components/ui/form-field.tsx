import { useState, useCallback } from "react"
import { Info } from "lucide-react"
import { Input } from "./input"
import { Label } from "./label"
import { Tooltip } from "./tooltip"

interface FormFieldProps {
  label: string
  tooltip?: string
  value: number | string
  onChange: (value: string) => void
  type?: string
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  step?: number
  placeholder?: string
}

export function FormField({
  label,
  tooltip,
  value,
  onChange,
  type = "number",
  prefix,
  suffix,
  min,
  max,
  step,
  placeholder,
}: FormFieldProps) {
  // For number fields: allow empty string while editing, coerce to "0" on blur
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const isNumber = type === 'number'

  const displayValue = isNumber && editing ? editValue : (value ?? '')

  const handleFocus = useCallback(() => {
    if (isNumber) {
      setEditing(true)
      // Show empty if value is 0, otherwise show current value
      setEditValue(value === 0 ? '' : String(value))
    }
  }, [isNumber, value])

  const handleBlur = useCallback(() => {
    if (isNumber) {
      setEditing(false)
      // If field is empty on blur, commit "0"
      if (editValue === '') {
        onChange('0')
      }
    }
  }, [isNumber, editValue, onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (isNumber && editing) {
      setEditValue(raw)
    }
    onChange(raw)
  }, [isNumber, editing, onChange])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>
        {tooltip && (
          <Tooltip content={tooltip}>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
        <Input
          type={type}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
        />
        {suffix && <span className="text-sm text-muted-foreground whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  )
}
