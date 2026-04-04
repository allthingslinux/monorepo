/* eslint-disable @typescript-eslint/no-unused-vars -- module augmentation: type params must match upstream */
"use client";

import { cn } from "@portal/utils/utils";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import React from "react";

import { Button } from "@atl/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@atl/ui/components/dropdown-menu";
import { Input } from "@atl/ui/components/input";
import { Label } from "@atl/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@atl/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@atl/ui/components/table";

// Type augmentation for TanStack Table column meta
declare module "@tanstack/react-table" {
  // Type parameters must match TanStack Table's signature exactly
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
    wrap?: boolean;
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enableColumnVisibility?: boolean;
  searchKey?: string;
  /** When set, renders search with a label in a grid (matches user table toolbar style). */
  searchLabel?: string;
  searchPlaceholder?: string;
  /** Rendered on the same row as the Columns button (left side). Use for filters. */
  toolbarContent?: React.ReactNode;
}

function DataTableInner<TData, TValue>({
  columns,
  data,
  searchKey,
  searchLabel,
  searchPlaceholder = "Search...",
  enableColumnVisibility = true,
  toolbarContent,
}: DataTableProps<TData, TValue>) {
  const searchId = React.useId();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      sorting,
    },
  });

  const showToolbar = Boolean(
    searchKey || enableColumnVisibility || toolbarContent
  );

  return (
    <div className="space-y-4">
      {showToolbar && (
        <div className="flex flex-wrap items-end gap-4">
          {toolbarContent && (
            <div className="min-w-0 flex-1">{toolbarContent}</div>
          )}
          {searchKey &&
            !toolbarContent &&
            (searchLabel ? (
              <search
                aria-label="Filter table"
                className="grid min-w-0 flex-1 gap-x-4 gap-y-2 sm:grid-cols-[minmax(280px,1fr)]"
              >
                <Label className="self-end" htmlFor={searchId}>
                  {searchLabel}
                </Label>
                <div className="min-w-0">
                  <Input
                    autoComplete="off"
                    className="h-9 w-full"
                    id={searchId}
                    onChange={(event) =>
                      table
                        .getColumn(searchKey)
                        ?.setFilterValue(event.target.value)
                    }
                    placeholder={searchPlaceholder}
                    type="search"
                    value={
                      (table
                        .getColumn(searchKey)
                        ?.getFilterValue() as string) ?? ""
                    }
                  />
                </div>
              </search>
            ) : (
              <Input
                className="max-w-sm"
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                placeholder={searchPlaceholder}
                value={
                  (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
                }
              />
            ))}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button className="shrink-0" variant="outline" />}
              >
                Columns
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      checked={column.getIsVisible()}
                      className="capitalize"
                      key={column.id}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { meta } = header.column.columnDef;
                  const size = header.getSize();
                  return (
                    <TableHead
                      className={cn(
                        meta?.align === "right" && "text-right",
                        meta?.align === "center" && "text-center"
                      )}
                      key={header.id}
                      style={{
                        maxWidth: header.column.columnDef.maxSize
                          ? `${header.column.columnDef.maxSize}px`
                          : undefined,
                        minWidth: `${header.column.columnDef.minSize ?? header.column.columnDef.size ?? 150}px`,
                        width: size === 150 ? undefined : `${size}px`,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => {
                    const { meta } = cell.column.columnDef;
                    const { getSize } = cell.column;
                    const size = getSize();
                    return (
                      <TableCell
                        className={cn(
                          meta?.align === "right" && "text-right",
                          meta?.align === "center" && "text-center",
                          meta?.wrap === true && "whitespace-normal!"
                        )}
                        key={cell.id}
                        style={{
                          maxWidth: cell.column.columnDef.maxSize
                            ? `${cell.column.columnDef.maxSize}px`
                            : undefined,
                          minWidth: `${cell.column.columnDef.minSize ?? cell.column.columnDef.size ?? 150}px`,
                          width: size === 150 ? undefined : `${size}px`,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-sm font-medium">
            {table.getFilteredRowModel().rows.length} of{" "}
            {table.getCoreRowModel().rows.length} row(s)
          </p>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            value={`${table.getState().pagination.pageSize}`}
          >
            <SelectTrigger className="h-8 min-w-[4rem]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-1">
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.firstPage()}
              size="sm"
              variant="outline"
            >
              {"<<"}
            </Button>
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="sm"
              variant="outline"
            >
              {"<"}
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="sm"
              variant="outline"
            >
              {">"}
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.lastPage()}
              size="sm"
              variant="outline"
            >
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const DataTable = React.memo(DataTableInner) as typeof DataTableInner;
