"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { componentTextSizes, iconSizes } from "@/lib/design-system"
import { useDebounce } from "@/shared/hooks/useDebounce"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [localValue, setLocalValue] = React.useState(value)
  const debouncedValue = useDebounce(localValue, debounceMs)

  React.useEffect(() => {
    onChange(debouncedValue)
  }, [debouncedValue, onChange])

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <div className={cn("relative", className)}>
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", iconSizes.sm)} />
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-9 w-full", componentTextSizes.form.input)}
      />
    </div>
  )
}
