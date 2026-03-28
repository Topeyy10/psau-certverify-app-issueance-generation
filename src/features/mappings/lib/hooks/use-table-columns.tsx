"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { DataRow } from "../types";

type ColumnHeaderMap = Record<string, string>;

export const useTableColumns = (
  data: DataRow[],
  headerMap: ColumnHeaderMap = {},
): ColumnDef<DataRow>[] => {
  return useMemo(() => {
    if (data.length === 0) return [];

    // Get all unique keys from the data (excluding 'id')
    const allKeys = new Set<string>();
    data.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "id") {
          allKeys.add(key);
        }
      });
    });

    // Create columns for each key
    return Array.from(allKeys).map((key) => ({
      accessorKey: key,
      header: headerMap[key] || key.charAt(0).toUpperCase() + key.slice(1),
      cell: ({ row }) => {
        const value = row.getValue(key);
        return (
          <div className="truncate max-w-[200px]" title={String(value)}>
            {String(value)}
          </div>
        );
      },
    }));
  }, [data, headerMap]);
};
