"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type DataTableColumn<T> = {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  headClassName?: string
  cellClassName?: string
  ariaSort?: React.AriaAttributes["aria-sort"]
}

type DataTableColumnMeta = {
  headClassName?: string
  cellClassName?: string
  ariaSort?: React.AriaAttributes["aria-sort"]
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  emptyMessage?: string
  emptyOverlay?: React.ReactNode
  toolbar?: React.ReactNode
  className?: string
  tableClassName?: string
  rowClassName?: string | ((row: T) => string)
  rowHoverContent?: (row: T) => React.ReactNode
  rowHoverContentClassName?: string
  initialPageSize?: number
  pageSizeOptions?: number[]
  paginationResetKey?: string
  itemLabel?: string
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  emptyMessage = "No results.",
  emptyOverlay,
  toolbar,
  className,
  tableClassName,
  rowClassName,
  rowHoverContent,
  rowHoverContentClassName,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  paginationResetKey,
  itemLabel = "results",
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = React.useState<{
    id: string
    row: T
    x: number
    y: number
  } | null>(null)
  const [hoverCardSize, setHoverCardSize] = React.useState({ width: 336, height: 360 })
  const hoverCardRef = React.useRef<HTMLDivElement | null>(null)
  const pendingHoverRowRef = React.useRef<{
    id: string
    row: T
    x: number
    y: number
  } | null>(null)
  const openHoverCardTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeHoverCardTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const columnDefs = React.useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        header: () => column.header,
        cell: ({ row }) => column.cell(row.original),
        meta: {
          headClassName: column.headClassName,
          cellClassName: column.cellClassName,
          ariaSort: column.ariaSort,
        } satisfies DataTableColumnMeta,
      })),
    [columns]
  )

  const table = useReactTable({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => getRowId(row),
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      pagination,
    },
  })

  React.useEffect(() => {
    setPagination((current) => {
      if (current.pageSize === initialPageSize) return current
      return {
        pageIndex: 0,
        pageSize: initialPageSize,
      }
    })
  }, [initialPageSize])

  React.useEffect(() => {
    if (paginationResetKey === undefined) return
    setPagination((current) => {
      if (current.pageIndex === 0) return current
      return {
        ...current,
        pageIndex: 0,
      }
    })
  }, [paginationResetKey])

  React.useEffect(() => {
    setPagination((current) => {
      const pageCount = Math.ceil(data.length / current.pageSize)
      if (pageCount <= 0) {
        if (current.pageIndex === 0) return current
        return {
          ...current,
          pageIndex: 0,
        }
      }

      if (current.pageIndex < pageCount) return current
      return {
        ...current,
        pageIndex: pageCount - 1,
      }
    })
  }, [data.length])

  React.useEffect(() => {
    if (!hoveredRow || !hoverCardRef.current) return

    const bounds = hoverCardRef.current.getBoundingClientRect()
    setHoverCardSize((current) => {
      if (current.width === bounds.width && current.height === bounds.height) return current
      return { width: bounds.width, height: bounds.height }
    })
  }, [hoveredRow])

  React.useEffect(() => {
    if (!hoveredRow) return

    const closeOnScroll = () => setHoveredRow(null)
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHoveredRow(null)
    }

    window.addEventListener("scroll", closeOnScroll, true)
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      window.removeEventListener("scroll", closeOnScroll, true)
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [hoveredRow])

  React.useEffect(() => {
    return () => {
      if (openHoverCardTimerRef.current) clearTimeout(openHoverCardTimerRef.current)
      if (closeHoverCardTimerRef.current) clearTimeout(closeHoverCardTimerRef.current)
    }
  }, [])

  const cancelHoverCardOpen = () => {
    if (!openHoverCardTimerRef.current) return
    clearTimeout(openHoverCardTimerRef.current)
    openHoverCardTimerRef.current = null
  }

  const cancelHoverCardClose = () => {
    if (!closeHoverCardTimerRef.current) return
    clearTimeout(closeHoverCardTimerRef.current)
    closeHoverCardTimerRef.current = null
  }

  const scheduleHoverCardClose = () => {
    cancelHoverCardClose()
    closeHoverCardTimerRef.current = setTimeout(() => setHoveredRow(null), 120)
  }

  const scheduleHoverCardOpen = (row: T, id: string, x: number, y: number) => {
    cancelHoverCardOpen()
    pendingHoverRowRef.current = { id, row, x, y }
    openHoverCardTimerRef.current = setTimeout(() => {
      if (pendingHoverRowRef.current?.id === id) {
        setHoveredRow(pendingHoverRowRef.current)
      }
      openHoverCardTimerRef.current = null
    }, 180)
  }

  const hoverCardPosition = React.useMemo(() => {
    if (!hoveredRow || typeof window === "undefined") return null

    const viewportPadding = 12
    const pointerGap = 16
    const maxLeft = Math.max(viewportPadding, window.innerWidth - hoverCardSize.width - viewportPadding)
    const maxTop = Math.max(viewportPadding, window.innerHeight - hoverCardSize.height - viewportPadding)
    const preferredLeft = hoveredRow.x + pointerGap
    const left = preferredLeft + hoverCardSize.width <= window.innerWidth - viewportPadding
      ? preferredLeft
      : hoveredRow.x - hoverCardSize.width - pointerGap

    return {
      left: Math.min(Math.max(left, viewportPadding), maxLeft),
      top: Math.min(Math.max(hoveredRow.y - 24, viewportPadding), maxTop),
    }
  }, [hoverCardSize, hoveredRow])

  const isEmpty = table.getRowModel().rows.length === 0
  const renderDataRow = (row: ReturnType<typeof table.getRowModel>["rows"][number]) => {
    const originalRow = row.original
    const rowNode = (
      <TableRow
        key={row.id}
        onPointerEnter={rowHoverContent ? (event) => {
          if (event.pointerType === "touch") return
          cancelHoverCardClose()
          scheduleHoverCardOpen(originalRow, row.id, event.clientX, event.clientY)
        } : undefined}
        onPointerMove={rowHoverContent ? (event) => {
          if (event.pointerType === "touch") return
          if (hoveredRow?.id !== row.id && pendingHoverRowRef.current?.id === row.id) {
            pendingHoverRowRef.current = {
              id: row.id,
              row: originalRow,
              x: event.clientX,
              y: event.clientY,
            }
          }
        } : undefined}
        onPointerLeave={rowHoverContent ? () => {
          cancelHoverCardOpen()
          pendingHoverRowRef.current = null
          scheduleHoverCardClose()
        } : undefined}
        className={cn(
          "bg-white hover:bg-muted/20",
          rowHoverContent ? "cursor-pointer" : undefined,
          typeof rowClassName === "function" ? rowClassName(originalRow) : rowClassName
        )}
      >
        {row.getVisibleCells().map((cell) => {
          const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined

          return (
            <TableCell key={cell.id} className={cn("px-4 py-2.5", meta?.cellClassName)}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          )
        })}
      </TableRow>
    )

    return rowNode
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border/70 bg-white shadow-sm", className)}>
      {toolbar ? <div className="border-b bg-white px-4 py-4">{toolbar}</div> : null}
      {isEmpty && emptyOverlay ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex min-h-[260px] items-center justify-center px-6">
          {emptyOverlay}
        </div>
      ) : null}
      <div className="overflow-x-auto bg-white">
        <TooltipProvider>
          <Table className={cn("min-w-full", tableClassName)}>
            <TableHeader className="bg-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-white">
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined

                    return (
                      <TableHead
                        key={header.id}
                        aria-sort={meta?.ariaSort}
                        className={cn("h-12 whitespace-nowrap px-4 text-sm font-medium text-muted-foreground", meta?.headClassName)}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isEmpty ? (
                <TableRow className="bg-white">
                  <TableCell colSpan={columns.length} className={cn("h-24 text-center text-muted-foreground", emptyOverlay ? "text-transparent" : undefined)}>
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => renderDataRow(row))
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>

      <div className="flex flex-col gap-3 border-t bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Menampilkan {table.getRowModel().rows.length} dari {data.length} {itemLabel}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Baris per halaman</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[76px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Halaman {table.getPageCount() === 0 ? 0 : table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="Halaman pertama"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Halaman terakhir"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {rowHoverContent && hoveredRow && hoverCardPosition && typeof document !== "undefined"
        ? createPortal(
          <div
            ref={hoverCardRef}
            className={cn(
              "fixed z-50 max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-md border border-border bg-popover p-0 text-popover-foreground shadow-xl",
              rowHoverContentClassName
            )}
            style={hoverCardPosition}
            onPointerEnter={cancelHoverCardClose}
            onPointerLeave={scheduleHoverCardClose}
          >
            {rowHoverContent(hoveredRow.row)}
          </div>,
          document.body
        )
        : null}
    </div>
  )
}
