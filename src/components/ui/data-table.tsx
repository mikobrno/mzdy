import { useState, useMemo } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface Column<T> {
  key: keyof T | string
  title: string
  sortable?: boolean
  width?: string
  render?: (value: any, item: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

export interface TableAction<T> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (item: T) => void
  variant?: 'default' | 'destructive' | 'secondary'
  show?: (item: T) => boolean
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  onSort?: (key: string, order: 'asc' | 'desc') => void
  actions?: TableAction<T>[]
  isLoading?: boolean
  emptyMessage?: string
  selectedItems?: T[]
  onSelectionChange?: (items: T[]) => void
  bulkActions?: TableAction<T[]>[]
  getItemId?: (item: T, index?: number) => string | number
}

export function DataTable<T>({
  data,
  columns,
  pagination,
  onPageChange,
  onLimitChange,
  onSort,
  actions,
  isLoading = false,
  emptyMessage = 'Žádná data k zobrazení',
  selectedItems = [],
  onSelectionChange,
  bulkActions = [],
  getItemId = (_item: T, index?: number) => (index ?? 0)
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  const handleSort = (key: string) => {
    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ key, direction })
    onSort?.(key, direction)
  }

  const isSelected = (item: T) => {
    const itemId = getItemId(item)
    return selectedItems.some(selected => getItemId(selected) === itemId)
  }

  const toggleSelection = (item: T) => {
    const itemId = getItemId(item)
    const isCurrentlySelected = isSelected(item)
    
    if (isCurrentlySelected) {
      onSelectionChange?.(selectedItems.filter(selected => getItemId(selected) !== itemId))
    } else {
      onSelectionChange?.([...selectedItems, item])
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === data.length) {
      onSelectionChange?.([])
    } else {
      onSelectionChange?.(data)
    }
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1
  const canPrevious = pagination ? pagination.page > 1 : false
  const canNext = pagination ? pagination.page < totalPages : false

  const paginationButtons = useMemo(() => {
    if (!pagination || totalPages <= 1) return []

    const buttons = []
    const { page } = pagination

    // Vždy zobrazit první stránku
    if (page > 3) {
      buttons.push(1)
      if (page > 4) buttons.push('...')
    }

    // Okolní stránky
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      buttons.push(i)
    }

    // Vždy zobrazit poslední stránku
    if (page < totalPages - 2) {
      if (page < totalPages - 3) buttons.push('...')
      buttons.push(totalPages)
    }

    return buttons
  }, [pagination, totalPages])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Načítání dat...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Bulk actions */}
        {selectedItems.length > 0 && bulkActions.length > 0 && (
          <div className="p-4 bg-blue-50 border-b flex items-center justify-between">
            <span className="text-sm text-blue-700">
              Vybráno: {selectedItems.length} položek
            </span>
            <div className="flex items-center gap-2">
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'default'}
                  onClick={() => action.onClick(selectedItems)}
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {/* Selection checkbox */}
                {onSelectionChange && (
                  <th className="w-12 p-4">
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedItems.length === data.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}

                {/* Column headers */}
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`p-4 text-left text-sm font-medium text-gray-700 ${
                      column.width ? `w-[${column.width}]` : ''
                    } ${column.align === 'center' ? 'text-center' : ''} ${
                      column.align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key as string)}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        {column.title}
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </button>
                    ) : (
                      column.title
                    )}
                  </th>
                ))}

                {/* Actions column */}
                {actions && actions.length > 0 && (
                  <th className="p-4 w-24 text-right">Akce</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (onSelectionChange ? 1 : 0) + (actions?.length ? 1 : 0)} 
                    className="p-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, rowIndex) => (
                  <tr 
                    key={getItemId(item, rowIndex)}
                    className={`hover:bg-gray-50 ${isSelected(item) ? 'bg-blue-50' : ''}`}
                  >
                    {/* Selection checkbox */}
                    {onSelectionChange && (
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected(item)}
                          onChange={() => toggleSelection(item)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map((column, colIndex) => {
                      const keyStr = String(column.key)
                      const value = keyStr.includes('.') 
                        ? keyStr.split('.').reduce((obj, key) => (obj as any)?.[key], item as any)
                        : (item as any)[keyStr]

                      return (
                        <td 
                          key={colIndex}
                          className={`p-4 text-sm ${
                            column.align === 'center' ? 'text-center' : ''
                          } ${column.align === 'right' ? 'text-right' : ''}`}
                        >
                          {column.render ? column.render(value, item, rowIndex) : value}
                        </td>
                      )
                    })}

                    {/* Actions */}
                    {actions && actions.length > 0 && (
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {actions
                            .filter(action => !action.show || action.show(item))
                            .slice(0, 2) // Zobrazit pouze první 2 akce
                            .map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                size="sm"
                                variant="ghost"
                                onClick={() => action.onClick(item)}
                                title={action.label}
                              >
                                {action.icon && <action.icon className="h-4 w-4" />}
                              </Button>
                            ))}
                          
                          {actions.filter(action => !action.show || action.show(item)).length > 2 && (
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Zobrazeno {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} z {pagination.total}
              </span>
              
              {onLimitChange && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Položek na stránku:</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => onLimitChange(parseInt(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    aria-label="Položek na stránku"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* First page */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPageChange?.(1)}
                disabled={!canPrevious}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              {/* Previous page */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={!canPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              {paginationButtons.map((pageNum, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={pageNum === pagination.page ? 'default' : 'ghost'}
                  onClick={() => typeof pageNum === 'number' && onPageChange?.(pageNum)}
                  disabled={pageNum === '...'}
                >
                  {pageNum}
                </Button>
              ))}

              {/* Next page */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={!canNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Last page */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPageChange?.(totalPages)}
                disabled={!canNext}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper komponenty pro časté použití
export function StatusBadge({ status }: { status: 'active' | 'inactive' | boolean }) {
  const isActive = typeof status === 'boolean' ? status : status === 'active'
  
  return (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? 'Aktivní' : 'Neaktivní'}
    </Badge>
  )
}

export function DateCell({ date }: { date: Date | string }) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return (
    <span className="text-gray-600">
      {dateObj.toLocaleDateString('cs-CZ')}
    </span>
  )
}

export function NumberCell({ value, currency = false }: { value: number; currency?: boolean }) {
  const formatter = new Intl.NumberFormat('cs-CZ', {
    style: currency ? 'currency' : 'decimal',
    currency: currency ? 'CZK' : undefined,
    minimumFractionDigits: currency ? 0 : undefined
  })
  
  return <span>{formatter.format(value)}</span>
}
