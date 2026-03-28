"use client";

import { useMemo } from "react";
import { useData } from "../../lib/contexts/data-provider";
import type { PlaceholderMapping } from "../../lib/types";
import { EmptyColumn, PlaceholderDropZone } from "../layout";
import { MappingCardWrapper } from "../layout/mapping-card-wrapper";

const PlaceholderMappings = () => {
  const { state, placeholders } = useData();

  const availableColumns = useMemo(
    () =>
      state.data.length > 0
        ? Object.keys(state.data[0]).filter((key) => key !== "id")
        : [],
    [state.data],
  );

  const mappingLookup = useMemo(
    () =>
      state.placeholderMappings.reduce(
        (acc, mapping) => {
          acc[mapping.placeholderKey] = mapping;
          return acc;
        },
        {} as Record<string, PlaceholderMapping>,
      ),
    [state.placeholderMappings],
  );

  if (state.mode === "manual") return null;

  return (
    <MappingCardWrapper group="fieldMapping" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableColumns.length ? (
          placeholders.map(
            (p) =>
              p.mappable &&
              !p.isMeta && (
                <PlaceholderDropZone
                  key={p.key}
                  placeholderKey={p.key}
                  label={p.label}
                  mappedColumns={mappingLookup[p.key]?.columns || []}
                  separator={mappingLookup[p.key]?.separator || " "}
                  mapping={mappingLookup[p.key]}
                  data={state.data}
                  mode={state.mode}
                />
              ),
          )
        ) : (
          <EmptyColumn />
        )}
      </div>
    </MappingCardWrapper>
  );
};

export { PlaceholderMappings };
