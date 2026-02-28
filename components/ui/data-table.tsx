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
    <div className={cn("overflow-hidden rounded-xl border border-border/70 bg-white shadow-sm", className)}>
      {toolbar ? <div className="border-b bg-white px-4 py-4">{toolbar}</div> : null}
      <div className="overflow-x-auto bg-white">
        <Table className={cn("min-w-full", tableClassName)}>
          <TableHeader className="bg-white">
            <TableRow className="bg-white">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "h-12 px-4 text-sm font-medium text-muted-foreground",
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
                    "bg-white hover:bg-muted/20",
                    typeof rowClassName === "function" ? rowClassName(row) : rowClassName
                  )}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={cn("px-4 py-2.5", column.cellClassName)}>
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
