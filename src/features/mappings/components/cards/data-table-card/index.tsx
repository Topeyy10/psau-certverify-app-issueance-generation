"use client";

import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type React from "react";
import { memo, useCallback, useMemo } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { useData } from "@/features/mappings/lib/contexts/data-provider";
import { useAppActions, useTableColumns } from "@/features/mappings/lib/hooks";
import type { DataRow } from "@/features/mappings/lib/types";
import { PaginationControls } from "../../actions";
import { MappingCardWrapper } from "../../layout";
import { TableHeader } from "./table-header";
import { TableRow } from "./table-row";

const DataTable = memo(() => {
  const { state, placeholders } = useData();
  const { setActiveRow, deleteRow } = useAppActions();

  const placeholderMap = useMemo(() => {
    return placeholders.reduce<Record<string, string>>((acc, ph) => {
      acc[ph.key] = ph.label;
      return acc;
    }, {});
  }, [placeholders]);

  const columns = useTableColumns(state.data, placeholderMap);

  const table = useReactTable<DataRow>({
    data: state.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const handleRowClick = useCallback(
    (rowId: string) => setActiveRow(rowId),
    [setActiveRow],
  );

  const handleRowDelete = useCallback(
    (rowId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      deleteRow(rowId);
    },
    [deleteRow],
  );

  const paginationInfo = useMemo(() => {
    const { pageIndex, pageSize } = table.getState().pagination;
    return {
      start: pageIndex * pageSize + 1,
      end: Math.min((pageIndex + 1) * pageSize, state.data.length),
      total: state.data.length,
      pageIndex,
      pageCount: table.getPageCount(),
    };
  }, [state.data.length, table.getState, table.getPageCount]);

  const rows = table.getRowModel().rows;
  const hasData = rows.length > 0;

  return (
    <MappingCardWrapper group="dataPreview">
      <div className="space-y-2">
        <div className="rounded-md border">
          {hasData ? (
            <Table>
              <TableHeader table={table} />
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.original.id}
                    row={row}
                    isActive={state.activeRowId === row.original.id}
                    onRowClick={handleRowClick}
                    onRowDelete={handleRowDelete}
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-10 block">
              <p className="text-sm text-muted-foreground text-center">
                No data to display. To get started, please upload a file or add
                your first row.
              </p>
            </div>
          )}
        </div>

        {hasData && (
          <PaginationControls table={table} paginationInfo={paginationInfo} />
        )}
      </div>
    </MappingCardWrapper>
  );
});

export { DataTable };
