"use client";

import { useData } from "../contexts/data-provider";
import type { DataRow, InputMode, PlaceholderMapping } from "../types";

export function useAppActions() {
  const { dispatch } = useData();

  const setMode = (mode: InputMode) => {
    dispatch({ type: "SET_MODE", payload: mode });
  };

  const setData = (data: DataRow[]) => {
    dispatch({ type: "SET_DATA", payload: data });
  };

  const addRow = (row: DataRow) => {
    dispatch({ type: "ADD_ROW", payload: row });
  };

  const deleteRow = (id: string) => {
    dispatch({ type: "DELETE_ROW", payload: id });
  };

  const clearData = () => {
    dispatch({ type: "CLEAR_DATA" });
  };

  const setActiveRow = (id: string | null) => {
    dispatch({ type: "SET_ACTIVE_ROW", payload: id });
  };

  const setPlaceholderMappings = (mappings: PlaceholderMapping[]) => {
    dispatch({ type: "SET_PLACEHOLDER_MAPPINGS", payload: mappings });
  };

  const updatePlaceholderMapping = (mapping: PlaceholderMapping) => {
    dispatch({ type: "UPDATE_PLACEHOLDER_MAPPING", payload: mapping });
  };

  const resetMappings = () => {
    dispatch({ type: "RESET_MAPPINGS" });
  };

  return {
    setMode,
    setData,
    addRow,
    deleteRow,
    clearData,
    setActiveRow,
    setPlaceholderMappings,
    updatePlaceholderMapping,
    resetMappings,
  };
}
