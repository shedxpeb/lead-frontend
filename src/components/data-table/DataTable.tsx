'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search, Filter, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { TableSkeleton } from '@/components/loading/TableSkeleton';
import { componentTextSizes } from '@/lib/design-system';

export interface Column<T = Record<string, any>> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T = Record<string, any>> {
  data: T[];
  columns: Column<any>[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  rowActions?: (row: any) => React.ReactNode;
  emptyMessage?: string;
  enableSelection?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selectedIds: Set<string | number>) => void;
  rowIdKey?: string;
  onExport?: () => void;
  enableExport?: boolean;
  /** When false, hides built-in search/filter toolbar (use page-level SearchBar/FilterBar) */
  showToolbar?: boolean;
  /** Tighter cell padding for wide tables */
  compact?: boolean;
  /** Pagination props */
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  /** Sort props for server-side sorting */
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  currentSortBy?: string;
  currentSortOrder?: 'asc' | 'desc';
}

export const DataTable = function DataTable<T = Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  rowActions,
  emptyMessage = 'No data available',
  enableSelection = false,
  selectedRows = new Set(),
  onSelectionChange,
  rowIdKey = 'id',
  onExport,
  enableExport = false,
  showToolbar = true,
  compact = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  currentSortBy,
  currentSortOrder,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Use external sort state if provided, otherwise use internal state
  const effectiveSortColumn = currentSortBy ? (currentSortBy as keyof T) : sortColumn;
  const effectiveSortDirection = currentSortOrder || sortDirection;
  
  // Internal pagination state (used when external pagination not provided)
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(10);
  
  // Use external pagination if provided, otherwise use internal state
  const currentPage = pagination?.page ?? internalCurrentPage;
  const rowsPerPage = pagination?.pageSize ?? internalRowsPerPage;
  
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];

    if (showToolbar) {
      if (debouncedSearchTerm) {
        result = result.filter((row) =>
          columns.some((col) => {
            const value = (row as any)[col.key];
            return value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase());
          })
        );
      }

      if (filterColumn && filterValue && filterValue !== 'all') {
        result = result.filter((row) => {
          const value = (row as any)[filterColumn];
          return value?.toString().toLowerCase() === filterValue.toLowerCase();
        });
      }
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortColumn];
        const bValue = (b as any)[sortColumn];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, showToolbar, debouncedSearchTerm, sortColumn, sortDirection, filterColumn, filterValue, columns]);

  // Pagination
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  // Keep the current page within range when the data set shrinks (e.g. after a
  // search or filter narrows results) so users never land on an empty page.
  // Backend pages are 1-based — never emit page 0 when totalPages is 0.
  React.useEffect(() => {
    const safeTotalPages = Math.max(1, totalPages);
    if (currentPage > safeTotalPages) {
      if (pagination) {
        onPageChange?.(safeTotalPages);
      } else {
        setInternalCurrentPage(safeTotalPages);
      }
    }
  }, [currentPage, totalPages, pagination, onPageChange]);

  const paginatedData = useMemo(() => {
    // If external pagination is provided, data is already paginated from backend
    if (pagination) {
      return data;
    }
    const safeTotalPages = Math.max(1, totalPages);
    const safePage = Math.min(Math.max(1, currentPage), safeTotalPages);
    const startIndex = (safePage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, totalPages, rowsPerPage, data, pagination]);

  const handleSort = useCallback((column: keyof T) => {
    const newDirection = (effectiveSortColumn === column && effectiveSortDirection === 'asc') ? 'desc' : 'asc';
    
    if (onSortChange) {
      // Use server-side sorting
      onSortChange(column as string, newDirection);
    } else {
      // Use client-side sorting
      if (sortColumn === column) {
        setSortDirection(newDirection);
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    }
  }, [effectiveSortColumn, effectiveSortDirection, sortColumn, sortDirection, onSortChange]);

  const handlePageChange = useCallback((page: number) => {
    const safePage = Math.max(1, page);
    if (pagination) {
      onPageChange?.(safePage);
    } else {
      setInternalCurrentPage(safePage);
    }
  }, [pagination, onPageChange]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map((row) => (row as any)[rowIdKey]));
      onSelectionChange?.(allIds);
    } else {
      onSelectionChange?.(new Set());
    }
  }, [paginatedData, rowIdKey, onSelectionChange]);

  const handleSelectRow = useCallback((rowId: string | number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    onSelectionChange?.(newSelected);
  }, [selectedRows, onSelectionChange]);

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((row) => selectedRows.has((row as any)[rowIdKey]));
  const isSomeSelected = paginatedData.some((row) => selectedRows.has((row as any)[rowIdKey]));

  // Get unique values for filter
  const filterOptions = useMemo(() => {
    if (!filterColumn) return [];
    const uniqueValues = new Set(data.map((row) => (row as any)[filterColumn]?.toString()));
    return Array.from(uniqueValues).filter(Boolean);
  }, [data, filterColumn]);

  if (loading) {
    return <TableSkeleton rows={5} columns={columns.length} />;
  }

  return (
    <div className="space-y-4">
      {showToolbar && (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="relative flex-1 w-full sm:w-auto min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {columns.some((col) => col.filterable) && (
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filterColumn} onValueChange={setFilterColumn}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by column" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[9999]">
                  {columns.filter((col) => col.filterable).map((col) => (
                    <SelectItem key={col.key as string} value={col.key as string}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {filterColumn && (
                <Select value={filterValue} onValueChange={setFilterValue}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Value" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999]">
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {enableExport && onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex-1 sm:flex-none gap-1.5 px-2 sm:px-3 py-2 h-8 sm:h-9 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </div>
      </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto max-h-[500px] sm:max-h-[600px] overflow-y-auto">
          <Table className="w-full min-w-[960px]">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                {enableSelection && (
                  <TableHead className={cn('w-[44px] min-w-[44px] sticky left-0 bg-background z-20', compact ? 'p-2' : 'p-2')}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = isSomeSelected && !isAllSelected;
                        }
                      }}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectAll(e.target.checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </TableHead>
                )}
                {columns.map((col) => (
                  <TableHead
                    key={col.key as string}
                    className={cn(
                      compact ? 'px-2 py-2 text-xs' : undefined,
                      col.headerClassName,
                      col.className
                    )}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key as any)}
                        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                      >
                        {col.label}
                        {effectiveSortColumn === col.key && (
                          <span className="text-xs">
                            {effectiveSortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </TableHead>
                ))}
                {rowActions && (
                  <TableHead className={cn('w-[48px] min-w-[48px] sticky right-0 bg-background z-20 text-center', compact ? 'p-1' : 'p-0.5')}>
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (rowActions ? 1 : 0) + (enableSelection ? 1 : 0)} className="text-center py-8">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => {
                  const rowId = (row as any)[rowIdKey];
                  const isSelected = selectedRows.has(rowId);
                  // Use combination of rowId and index to ensure uniqueness even with duplicate IDs
                  const uniqueKey = rowId ? `${rowId}-${index}` : `row-${index}`;
                  return (
                    <TableRow
                      key={uniqueKey}
                      onClick={() => {
                        onRowClick?.(row);
                      }}
                      className={cn(
                        onRowClick && 'cursor-pointer hover:bg-muted/30',
                        isSelected && 'bg-muted/50'
                      )}
                    >
                      {enableSelection && (
                        <TableCell className="border-r border-border sticky left-0 bg-background z-20 p-2 min-w-[50px]" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectRow(rowId, e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 cursor-pointer"
                          />
                        </TableCell>
                      )}
                      {columns.map((col) => (
                        <TableCell
                          key={col.key as string}
                          className={cn(
                            compact ? 'px-2 py-2' : undefined,
                            componentTextSizes.table.cell,
                            col.className
                          )}
                        >
                          {col.render ? (
                            <span suppressHydrationWarning>
                              {col.render((row as any)[col.key], row)}
                            </span>
                          ) : (
                            (row as any)[col.key]?.toString()
                          )}
                        </TableCell>
                      ))}
                      {rowActions && (
                        <TableCell className="border-l border-border sticky right-0 bg-background z-20 text-center p-0.5" onClick={(e) => e.stopPropagation()}>
                          {rowActions(row)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 overflow-visible">
        <span className="text-xs sm:text-sm text-muted-foreground">
          {filteredData.length} record{filteredData.length === 1 ? '' : 's'}
        </span>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600">Rows per page:</span>
            <Select 
              value={rowsPerPage.toString()} 
              onValueChange={(v) => { 
                const newSize = Number(v);
                if (pagination) {
                  onPageSizeChange?.(newSize);
                } else {
                  setInternalRowsPerPage(newSize);
                  setInternalCurrentPage(1);
                }
              }}
            >
              <SelectTrigger className="w-[60px] sm:w-[70px] text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[9999]">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {totalPages > 1 && (
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-2 sm:px-3"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-7 h-7 sm:w-8 sm:h-8 text-xs"
                >
                  {page}
                </Button>
              ))}
              {totalPages > 5 && (
                <span className="text-xs text-muted-foreground">...</span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
