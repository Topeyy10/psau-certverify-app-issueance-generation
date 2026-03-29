"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortDirection,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownWideNarrowIcon,
  ArrowUpDownIcon,
  ArrowUpWideNarrowIcon,
  EyeIcon,
} from "lucide-react";
import type { SystemLog } from "@/aactions/shared/types";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";
import { useLogsActions, useLogsState } from "../../context/logs-provider";

const getSortIcon = (isSorted: false | SortDirection) => {
  if (isSorted === "asc") return <ArrowDownWideNarrowIcon className="size-4" />;
  if (isSorted === "desc") return <ArrowUpWideNarrowIcon className="size-4" />;
  return <ArrowUpDownIcon className="opacity-30 size-4" />;
};

interface LogsTableProps {
  onRowClick: (log: SystemLog) => void;
}

const LogsTable = ({ onRowClick }: LogsTableProps) => {
  const { data, sorting, page, pageSize, total, loading } = useLogsState();
  const { setSorting } = useLogsActions();

  const columns: ColumnDef<SystemLog>[] = [
    {
      accessorKey: "action",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Action
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => <Badge>{row.getValue("action")}</Badge>,
    },
    {
      accessorKey: "resourceType",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Resource
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => <div>{row.getValue("resourceType")}</div>,
    },
    {
      accessorKey: "userId",
      header: "User ID",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("userId")}</div>
      ),
    },
    {
      accessorKey: "userFullName",
      header: "User Name",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue("userFullName")}
        </div>
      ),
    },
    {
      accessorKey: "userRole",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => {
        const role = String(row.getValue("userRole") ?? "unknown");
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("ipAddress")}</div>
      ),
    },
    {
      accessorKey: "$createdAt",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatRelativeDate(row.getValue("$createdAt"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRowClick(row.original)}
          aria-label="View details"
        >
          <EyeIcon className="size-4" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.$id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting, pagination: { pageIndex: page - 1, pageSize } },
    manualSorting: true,
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
  });

  return (
    <DataTable
      table={table}
      colCount={columns.length}
      loading={loading}
      emptyMessage="No system logs available."
      loadingMessage="Loading system logs"
    />
  );
};

export { LogsTable };
