import { flexRender, type Row } from "@tanstack/react-table";
import { Trash2Icon } from "lucide-react";
import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { DataRow } from "@/features/mappings/lib/types";

const TableRowComponent = memo<{
  row: Row<DataRow>;
  isActive: boolean;
  onRowClick: (id: string) => void;
  onRowDelete: (id: string, e: React.MouseEvent) => void;
}>(({ row, isActive, onRowClick, onRowDelete }) => {
  const handleClick = useCallback(() => {
    onRowClick(row.original.id);
  }, [onRowClick, row.original.id]);

  const handleDelete = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onRowDelete(row.original.id, e);
    },
    [onRowDelete, row.original.id],
  );

  return (
    <TableRow
      data-state={isActive ? "selected" : undefined}
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleClick}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="py-2">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
      <TableCell className="py-2 text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="size-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2Icon className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

export { TableRowComponent as TableRow };
