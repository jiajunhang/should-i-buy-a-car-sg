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
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
