"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortDirection,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownWideNarrowIcon,
  ArrowUpDownIcon,
  ArrowUpWideNarrowIcon,
} from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatRelativeDate } from "@/lib/utils";
import type { Certificate, CertificateStatus } from "@/types";
import { STATUS_MAP } from "../../lib/constants/status";
import {
  useCertificatesActions,
  useCertificatesState,
} from "../../lib/context/data-provider";
import { RowAction } from "../actions/row-action";

const getSortIcon = (isSorted: false | SortDirection) => {
  if (isSorted === "asc") {
    return <ArrowDownWideNarrowIcon className="size-4" />;
  }
  if (isSorted === "desc") {
    return <ArrowUpWideNarrowIcon className="size-4" />;
  }
  return <ArrowUpDownIcon className="opacity-30 size-4" />;
};

const CertificatesTableContent = () => {
  const {
    data,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    total,
    page,
    pageSize,
    loading,
  } = useCertificatesState();

  const { setSorting, setColumnFilters, setColumnVisibility, setRowSelection } =
    useCertificatesActions();

  const columns: ColumnDef<Certificate>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "$id",
      header: ({ column }) => {
        return (
          <button
            type="button"
            className="flex items-center gap-x-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            {getSortIcon(column.getIsSorted())}
          </button>
        );
      },
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("$id")}</Badge>
      ),
    },
    {
      accessorKey: "recipientFullName",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Recipient Name
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("recipientFullName")}</div>
      ),
    },
    {
      accessorKey: "recipientEmail",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.getValue("recipientEmail")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as CertificateStatus;
        const statusInfo =
          STATUS_MAP[String(status) as keyof typeof STATUS_MAP];
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
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
        <div className="text-sm">
          {formatRelativeDate(row.getValue("$createdAt"))}
        </div>
      ),
    },
    {
      accessorKey: "$updatedAt",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated At
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {formatRelativeDate(row.getValue("$updatedAt"))}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <RowAction certificate={row.original} />,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.$id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize },
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pageSize),
  });

  return (
    <DataTable
      table={table}
      colCount={columns.length}
      loading={loading}
      emptyMessage="No certificates available"
      loadingMessage="Loading certificates..."
    />
  );
};

export { CertificatesTableContent };
