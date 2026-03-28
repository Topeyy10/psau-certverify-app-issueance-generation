"use client";

import type { RowSelectionState } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  rowSelection?: RowSelectionState;
  loading: boolean;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

const TablePagination = (props: PaginationProps) => {
  const { page, total, pageSize, rowSelection, loading, setPage, setPageSize } =
    props;

  const selectedCount = rowSelection ? Object.keys(rowSelection).length : null;
  if (!total) return null;

  return (
    <div className="flex flex-col items-center space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4 lg:space-x-8">
      {selectedCount && (
        <p className="text-sm text-muted-foreground">
          {selectedCount} of {total} row(s) selected
        </p>
      )}

      <div className="flex items-center space-x-2">
        <Label htmlFor="rowSizeInput">Rows per page:</Label>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px]" disabled={loading}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 15, 20, 25, 30].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8">
        <p className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {page} of {Math.ceil(total / pageSize) || 1}
        </p>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => setPage(1)}
            disabled={page === 1 || loading}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / pageSize) || loading}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => setPage(Math.ceil(total / pageSize))}
            disabled={page >= Math.ceil(total / pageSize) || loading}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { TablePagination };
