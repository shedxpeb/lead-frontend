"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { PageHeader } from "./PageHeader"
import { SearchBar } from "./SearchBar"
import { FilterBar, FilterConfig } from "./FilterBar"
import { FilterPopover } from "./FilterPopover"

type FilterMode = "inline" | "popover" | "collapsible"

interface StandardPageLayoutProps {
  title: string
  subtitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  headerActions?: React.ReactNode

  kpiCards?: React.ReactNode
  kpiGridClassName?: string

  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterConfig[]
  onClearFilters?: () => void
  filterMode?: FilterMode
  toolbarActions?: React.ReactNode

  children: React.ReactNode

  className?: string
}

export const StandardPageLayout = function StandardPageLayout({
  title,
  subtitle,
  breadcrumbs,
  headerActions,
  kpiCards,
  kpiGridClassName,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  onClearFilters,
  filterMode = "inline",
  toolbarActions,
  children,
  className,
}: StandardPageLayoutProps) {
  const useFilterPopover =
    filterMode === "popover" || filterMode === "collapsible"

  const showActionBar =
    searchValue !== undefined ||
    (filters && filters.length > 0) ||
    !!toolbarActions

  return (
    <div className={cn("flex flex-col gap-4 sm:gap-5 lg:gap-6 w-full max-w-full", className)}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      {kpiCards && (
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4",
          kpiGridClassName
        )}>
          {kpiCards}
        </div>
      )}

      {showActionBar && (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full">
          {searchValue !== undefined && onSearchChange && (
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="w-full sm:flex-1 sm:min-w-[180px] sm:max-w-md lg:max-w-lg xl:max-w-xl"
            />
          )}

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {toolbarActions}

            {filters && filters.length > 0 && useFilterPopover && (
              <FilterPopover filters={filters} onClearAll={onClearFilters} />
            )}
          </div>
        </div>
      )}

      {filters && filters.length > 0 && filterMode === "inline" && (
        <FilterBar
          filters={filters}
          onClearAll={onClearFilters}
          layout={filters.length > 4 ? "panel" : "inline"}
          primaryCount={4}
        />
      )}

      <div className="flex-1 w-full max-w-full overflow-x-hidden">{children}</div>
    </div>
  )
}
