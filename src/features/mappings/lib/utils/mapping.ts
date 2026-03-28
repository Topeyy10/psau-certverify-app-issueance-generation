import type { DataRow, InputMode, PlaceholderMapping } from "../types";

export const getPreviewValue = (
  inputMode: InputMode,
  placeholderKey: string,
  placeholderMappings: PlaceholderMapping[],
  activeRow?: DataRow,
): string => {
  const mapping = placeholderMappings.find(
    (m) => m.placeholderKey === placeholderKey,
  );
  if (!mapping || !activeRow) return "";

  if (inputMode === "manual") {
    return activeRow[placeholderKey] || "";
  } else {
    const values = mapping.columns
      .map((column) => activeRow[column] || "")
      .filter((value) => String(value).trim() !== "");

    return values.join(mapping.separator);
  }
};
