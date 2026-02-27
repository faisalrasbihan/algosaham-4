"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
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

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  emptyMessage?: string
  toolbar?: React.ReactNode
  className?: string
  tableClassName?: string
  rowClassName?: string | ((row: T) => string)
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
}: DataTableProps<T>) {
  return (
    <div className={cn("rounded-xl border border-border/70 bg-white shadow-sm overflow-hidden", className)}>
      {toolbar ? <div className="border-b bg-white px-4 py-4">{toolbar}</div> : null}
      <div className="overflow-x-auto bg-white">
        <Table className={cn("min-w-full", tableClassName)}>
          <TableHeader className="bg-white">
            <TableRow className="bg-white">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "h-10 px-2",
                    column.headClassName
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow className="bg-white">
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  className={cn(
                    "bg-white",
                    typeof rowClassName === "function" ? rowClassName(row) : rowClassName
                  )}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={cn("p-2", column.cellClassName)}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
