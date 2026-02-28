"use client"

import * as React from "react"
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
}

type DataTableColumnMeta = {
  headClassName?: string
  cellClassName?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  emptyMessage?: string
  toolbar?: React.ReactNode
  className?: string
  tableClassName?: string
  rowClassName?: string | ((row: T) => string)
  initialPageSize?: number
  pageSizeOptions?: number[]
  paginationResetKey?: string
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  emptyMessage = "No results.",
  toolbar,
  className,
  tableClassName,
  rowClassName,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  paginationResetKey,
}: DataTableProps<T>) {
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

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border/70 bg-white shadow-sm", className)}>
      {toolbar ? <div className="border-b bg-white px-4 py-4">{toolbar}</div> : null}
      <div className="overflow-x-auto bg-white">
        <Table className={cn("min-w-full", tableClassName)}>
          <TableHeader className="bg-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-white">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined

                  return (
                    <TableHead
                      key={header.id}
                      className={cn("h-12 px-4 text-sm font-medium text-muted-foreground", meta?.headClassName)}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow className="bg-white">
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "bg-white hover:bg-muted/20",
                    typeof rowClassName === "function" ? rowClassName(row.original) : rowClassName
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Menampilkan {table.getRowModel().rows.length} dari {data.length} saham
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
    </div>
  )
}
