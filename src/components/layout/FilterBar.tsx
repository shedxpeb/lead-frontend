"use client"

import * as React from "react"
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { componentTextSizes, iconSizes } from "@/lib/design-system"

export interface FilterOption {
  value: string
  label: string
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

type FilterBarLayout = "inline" | "panel" | "popover"

interface FilterBarProps {
  filters: FilterConfig[]
  onClearAll?: () => void
  className?: string
  layout?: FilterBarLayout
  /** Filters shown in the primary row when layout is panel (default: 4) */
  primaryCount?: number
  /** Hide the panel header (e.g. when embedded in a popover with its own title) */
  showHeader?: boolean
  /** Column count when layout is popover */
  popoverColumns?: 1 | 2
  /** Tighter spacing for popover embedding */
  compact?: boolean
}

export function countActiveFilters(filters: FilterConfig[]): number {
  return filters.filter((f) => f.value !== "all" && f.value !== "").length
}

function FilterSelect({
  filter,
  stacked = false,
  compact = false,
}: {
  filter: FilterConfig
  stacked?: boolean
  compact?: boolean
}) {
  const select = (
    <Select value={filter.value} onValueChange={filter.onChange}>
      <SelectTrigger
        className={cn(
          stacked ? "w-full" : "w-32 sm:w-36 md:w-40",
          compact ? "h-8 text-xs" : "h-9"
        )}
      >
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        {filter.options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  if (stacked) {
    return (
      <div className={cn("flex flex-col min-w-0", compact ? "gap-1" : "gap-1.5")}>
        <label className={cn(compact ? "text-[11px] leading-tight" : componentTextSizes.form.label, "text-muted-foreground font-medium")}>
          {filter.label}
        </label>
        {select}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <label className={cn(componentTextSizes.form.label, "whitespace-nowrap text-muted-foreground")}>
        {filter.label}
      </label>
      {select}
    </div>
  )
}

export function FilterBar({
  filters,
  onClearAll,
  className,
  layout = "inline",
  primaryCount = 4,
  showHeader = true,
  popoverColumns = 2,
  compact = false,
}: FilterBarProps) {
  const [showMore, setShowMore] = React.useState(false)
  const hasActiveFilters = filters.some((f) => f.value !== "all" && f.value !== "")
  const activeCount = countActiveFilters(filters)

  if (layout === "popover") {
    return (
      <div className={cn("w-full min-w-0", className)}>
        <div
          className={cn(
            "grid",
            compact ? "gap-2.5" : "gap-3",
            popoverColumns === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
          )}
        >
          {filters.map((filter) => (
            <FilterSelect key={filter.key} filter={filter} stacked compact={compact} />
          ))}
        </div>
      </div>
    )
  }

  if (layout === "panel") {
    const primaryFilters = filters.slice(0, primaryCount)
    const secondaryFilters = filters.slice(primaryCount)
    const hasSecondaryActive = secondaryFilters.some((f) => f.value !== "all" && f.value !== "")

    return (
      <div className={cn("w-full min-w-0", className)}>
        <div className={cn(showHeader ? "rounded-lg border bg-muted/20 p-3 sm:p-4 space-y-3" : "space-y-3")}>
          {showHeader && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className={iconSizes.sm} />
              <span className={cn(componentTextSizes.button.md, "font-medium")}>Filters</span>
              {activeCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {activeCount}
                </Badge>
              )}
            </div>
            {hasActiveFilters && onClearAll && (
              <Button variant="ghost" size="sm" onClick={onClearAll} className="gap-1.5 h-8">
                <X className={iconSizes.xs} />
                Clear all
              </Button>
            )}
          </div>
          )}

          {!showHeader && hasActiveFilters && onClearAll && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={onClearAll} className="gap-1.5 h-8">
                <X className={iconSizes.xs} />
                Clear all
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {primaryFilters.map((filter) => (
              <FilterSelect key={filter.key} filter={filter} stacked />
            ))}
          </div>

          {secondaryFilters.length > 0 && (
            <>
              <div className="flex items-center justify-between lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMore((prev) => !prev)}
                  className="gap-1.5 h-8 px-2 text-muted-foreground"
                >
                  {showMore ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Show fewer filters
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      More filters ({secondaryFilters.length})
                      {hasSecondaryActive && !showMore && (
                        <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-1">
                          {secondaryFilters.filter((f) => f.value !== "all").length}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </div>

              <div
                className={cn(
                  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
                  !showMore && "hidden lg:grid"
                )}
              >
                {secondaryFilters.map((filter) => (
                  <FilterSelect key={filter.key} filter={filter} stacked />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className={iconSizes.sm} />
        <span className={cn(componentTextSizes.button.md, "font-medium")}>Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <FilterSelect key={filter.key} filter={filter} />
        ))}
      </div>

      {hasActiveFilters && onClearAll && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="gap-2">
          <X className={iconSizes.xs} />
          Clear All
        </Button>
      )}
    </div>
  )
}
