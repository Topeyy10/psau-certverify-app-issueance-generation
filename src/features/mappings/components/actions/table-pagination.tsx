import type { Table } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { DataRow } from "../../lib/types";

const PaginationControls = memo<{
  table: Table<DataRow>;
  paginationInfo: {
    start: number;
    end: number;
    total: number;
    pageIndex: number;
    pageCount: number;
  };
}>(({ table, paginationInfo }) => (
  <div className="flex flex-col sm:flex-row gap-2 items-center sm:justify-between">
    <div className="text-sm text-muted-foreground">
      Showing {paginationInfo.start} to {paginationInfo.end} of{" "}
      {paginationInfo.total} entries
    </div>
    <div className="flex items-center space-x-2 order-first sm:order-last">
      <Button
        variant="outline"
        size="icon"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronLeftIcon />
      </Button>
      <div className="flex items-center space-x-1">
        <span className="text-sm">Page</span>
        <span className="text-sm font-medium">
          {paginationInfo.pageIndex + 1} of {paginationInfo.pageCount}
        </span>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  </div>
));

export { PaginationControls };
