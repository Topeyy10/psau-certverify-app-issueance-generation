"use client";

import { useMemo } from "react";
import { getKeyIndex } from "@/lib/utils";
import { useData } from "../../lib/contexts/data-provider";
import { DraggableColumn, EmptyColumn, MappingCardWrapper } from "../layout";

const Columns = () => {
  const { state } = useData();

  const availableColumns = useMemo(
    () =>
      state.data.length > 0
        ? Object.keys(state.data[0]).filter((key) => key !== "id")
        : [],
    [state.data],
  );

  if (state.mode === "manual") return null;

  return (
    <MappingCardWrapper group="column">
      <div className=" gap-2 flex flex-wrap">
        {availableColumns.length ? (
          availableColumns.map((column) => (
            <DraggableColumn
              key={`${column}-${getKeyIndex()}`}
              column={column}
            />
          ))
        ) : (
          <EmptyColumn />
        )}
      </div>
    </MappingCardWrapper>
  );
};

export { Columns };
