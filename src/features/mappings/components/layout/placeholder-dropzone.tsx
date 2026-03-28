import { XIcon } from "lucide-react";
import { memo, useCallback, useId, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, getKeyIndex } from "@/lib/utils";
import { useAppActions } from "../../lib/hooks";
import { getPreviewValue } from "../../lib/utils";

const SeparatorInput = memo<{ value: string; onChange: (s: string) => void }>(
  ({ value, onChange }) => {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleTrigger = useCallback(() => {
      if (inputRef.current) {
        onChange(inputRef.current.value);
      }
    }, [onChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          handleTrigger();
        }
      },
      [handleTrigger],
    );

    return (
      <div className="flex items-center gap-x-2">
        <Label htmlFor={id} className="text-xs">
          Separator:
        </Label>
        <Input
          ref={inputRef}
          type="text"
          id={id}
          defaultValue={value}
          onBlur={handleTrigger}
          onKeyDown={handleKeyDown}
          className="h-(--text-xl) !text-xs rounded-sm px-1 max-w-[80px]"
          maxLength={3}
        />
      </div>
    );
  },
);

const PlaceholderDropZone = memo<{
  placeholderKey: string;
  label: string;
  mappedColumns: string[];
  separator: string;
  mapping: any;
  data: any[];
  mode: any;
}>(
  ({
    placeholderKey,
    label,
    mappedColumns,
    separator,
    mapping,
    data,
    mode,
  }) => {
    const { updatePlaceholderMapping } = useAppActions();

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        const column = e.dataTransfer.getData("text/plain");
        if (
          !column ||
          !mapping ||
          mapping.columns.length >= 3 ||
          mapping.columns.includes(column)
        )
          return;

        updatePlaceholderMapping({
          ...mapping,
          columns: [...mapping.columns, column],
        });
      },
      [mapping, updatePlaceholderMapping],
    );

    const handleRemove = useCallback(
      (column: string) => {
        if (!mapping) return;
        updatePlaceholderMapping({
          ...mapping,
          columns: mapping.columns.filter((c: string) => c !== column),
        });
      },
      [mapping, updatePlaceholderMapping],
    );

    const handleSeparatorChange = useCallback(
      (newSeparator: string) => {
        if (!mapping) return;
        updatePlaceholderMapping({
          ...mapping,
          separator: newSeparator,
        });
      },
      [mapping, updatePlaceholderMapping],
    );

    const previewValue = useMemo(
      () => getPreviewValue(mode, placeholderKey, [mapping], data[0]),
      [mode, placeholderKey, mapping, data],
    );

    return (
      <div className="flex flex-col space-y-1">
        <p className="text-sm leading-none font-semibold">{label}</p>
        <section
          role="region"
          aria-label="File dropzone"
          className={cn(
            "flex-1 rounded-md border-2 border-dashed items-center min-h-16 transition-colors p-3 space-y-2",
            mappedColumns.length > 0 && "border-border bg-muted/50",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={handleDrop}
        >
          {mappedColumns.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Drop columns here (up to 3)
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {mappedColumns.map((column) => (
                <Badge
                  key={`${column}-${getKeyIndex()}`}
                  className="!pr-1 rounded-sm"
                >
                  {column}
                  <button
                    type="button"
                    className="hover:text-destructive"
                    onClick={() => handleRemove(column)}
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {mappedColumns.length > 1 && (
            <SeparatorInput
              value={separator}
              onChange={handleSeparatorChange}
            />
          )}
        </section>
        <p className="text-xs text-muted-foreground">Preview: {previewValue}</p>
      </div>
    );
  },
);

export { PlaceholderDropZone };
