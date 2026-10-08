"use client"

import * as React from "react"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FilterBar, FilterConfig, countActiveFilters } from "./FilterBar"

interface FilterPopoverProps {
  filters: FilterConfig[]
  onClearAll?: () => void
  className?: string
}

function getPopoverSizing(filterCount: number) {
  if (filterCount <= 3) {
    return {
      widthClass: "w-[min(calc(100vw-2rem),400px)]",
      columns: 1 as const,
      scrollable: false,
    }
  }
  if (filterCount <= 6) {
    return {
      widthClass: "w-[min(calc(100vw-2rem),500px)]",
      columns: 2 as const,
      scrollable: false,
    }
  }
  return {
    widthClass: "w-[min(calc(100vw-2rem),600px)]",
    columns: 2 as const,
    scrollable: true,
  }
}

export function FilterPopover({ filters, onClearAll, className }: FilterPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const activeCount = countActiveFilters(filters)
  const sizing = getPopoverSizing(filters.length)

  const handleClear = () => {
    onClearAll?.()
  }

  const handleApply = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={activeCount > 0 ? "secondary" : "outline"}
          size="sm"
          className={cn(
            "h-9 gap-1.5 shrink-0",
            activeCount > 0 && "border-primary/40",
            className
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeCount > 0 && (
            <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn(
          sizing.widthClass,
          "p-0 rounded-xl border shadow-lg",
          "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85"
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className={cn(sizing.scrollable && "flex flex-col max-h-[min(70vh,28rem)]")}>
          <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-2 shrink-0">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">Filters</span>
            {activeCount > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] leading-none">
                {activeCount}
              </Badge>
            )}
          </div>

          <div
            className={cn(
              "px-3",
              sizing.scrollable ? "overflow-y-auto min-h-0 flex-1 pb-1" : "pb-2"
            )}
          >
            <FilterBar
              filters={filters}
              layout="popover"
              showHeader={false}
              popoverColumns={sizing.columns}
              compact
            />
          </div>

          <div className="flex items-center justify-end gap-1.5 px-3 py-2 border-t shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={activeCount === 0}
              className="h-8 px-3 text-xs"
            >
              Clear
            </Button>
            <Button size="sm" onClick={handleApply} className="h-8 px-3 text-xs">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
