"use client";

import { clientUniqueId } from "@/lib/id";
import axios from "axios";
import { Canvas, type FabricObject, type FabricText, type Rect } from "fabric";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useShallow } from "zustand/react/shallow";
import {
  isQR,
  isText,
  type Placeholder as PlaceholderObject,
} from "@/features/editor/lib/types";
import { applyDefaults, findArtboardOrFallback } from "@/features/editor/lib/utils";
import { useToastStore } from "@/stores/toast-store";
import { META_PLACEHOLDERS, NON_MAPPABLE_VARIANTS } from "../constants";
import type {
  AppAction,
  AppContextState,
  AppState,
  DataRow,
  MetaMappings,
  Placeholder,
  PlaceholderMapping,
} from "../types";

/** Helpers */
const createInitialMappings = (
  placeholders: readonly Placeholder[],
): PlaceholderMapping[] =>
  placeholders.map((p) => ({
    placeholderKey: p.key,
    columns: [],
    separator: " ",
  }));

const createInitialState = (): AppState => ({
  mode: "manual",
  data: [],
  activeRowId: null,
  placeholderMappings: [],
  loading: true,
  error: null,
  metaPlaceholders: [...META_PLACEHOLDERS],
});

/** Memoized reducer */
const createAppReducer = (placeholders: readonly Placeholder[]) => {
  return function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
      case "SET_MODE":
        return state.mode === action.payload
          ? state
          : { ...state, mode: action.payload };

      case "SET_DATA": {
        const newActiveRowId =
          action.payload.length > 0 ? action.payload[0].id : null;
        return {
          ...state,
          data: action.payload,
          activeRowId: newActiveRowId,
        };
      }

      case "ADD_ROW":
        return {
          ...state,
          data: [...state.data, action.payload],
          activeRowId: action.payload.id,
        };

      case "DELETE_ROW": {
        const filteredData = state.data.filter(
          (row) => row.id !== action.payload,
        );
        const newActiveRowId =
          filteredData.length > 0
            ? state.activeRowId === action.payload
              ? filteredData[0].id
              : state.activeRowId
            : null;

        return {
          ...state,
          data: filteredData,
          activeRowId: newActiveRowId,
        };
      }

      case "CLEAR_DATA":
        return {
          ...state,
          data: [],
          activeRowId: null,
          placeholderMappings: createInitialMappings(placeholders),
        };

      case "SET_ACTIVE_ROW":
        return state.activeRowId === action.payload
          ? state
          : { ...state, activeRowId: action.payload };

      case "SET_PLACEHOLDER_MAPPINGS":
        return { ...state, placeholderMappings: action.payload };

      case "UPDATE_PLACEHOLDER_MAPPING": {
        const newMappings = state.placeholderMappings.map((mapping) =>
          mapping.placeholderKey === action.payload.placeholderKey
            ? action.payload
            : mapping,
        );
        return { ...state, placeholderMappings: newMappings };
      }

      case "RESET_MAPPINGS":
        return {
          ...state,
          placeholderMappings: createInitialMappings(placeholders),
          metaPlaceholders: [...META_PLACEHOLDERS],
        };

      case "SET_LOADING":
        return state.loading === action.payload
          ? state
          : { ...state, loading: action.payload };

      case "SET_ERROR":
        return state.error === action.payload
          ? state
          : { ...state, error: action.payload };

      case "SET_PLACEHOLDERS": {
        const allPlaceholders = [...action.payload, ...META_PLACEHOLDERS];
        return {
          ...state,
          placeholderMappings: createInitialMappings(allPlaceholders),
          metaPlaceholders: [...META_PLACEHOLDERS],
        };
      }

      default:
        return state;
    }
  };
};

/** Main context */
const AppContext = createContext<AppContextState | null>(null);

export const DataProvider = ({
  children,
  id,
  initialData = {},
}: {
  children: React.ReactNode;
  id: string;
  initialData?: Partial<AppState>;
}) => {
  const [placeholders, setPlaceholders] = useState<readonly Placeholder[]>([]);
  const canvasRef = useRef<Canvas | null>(null);
  const artboardRef = useRef<Rect | null>(null);
  const loadingRef = useRef(false);
  const defaultPlaceholderTextRef = useRef<Record<string, string>>({});
  const [templateLoaded, setTemplateLoaded] = useState(false);

  const { stopError, stopSuccess } = useToastStore(
    useShallow((s) => ({
      stopError: s.stopError,
      stopSuccess: s.stopSuccess,
    })),
  );

  // Memoized reducer with stable reference
  const reducer = useMemo(() => createAppReducer(placeholders), [placeholders]);
  const [state, dispatch] = useReducer(reducer, {
    ...createInitialState(),
    ...initialData,
  });

  // Optimized lookups with shallow equality check
  const mappingsMap = useMemo(() => {
    const map = new Map<string, PlaceholderMapping>();
    state.placeholderMappings.forEach((mapping) => {
      map.set(mapping.placeholderKey, mapping);
    });
    return map;
  }, [state.placeholderMappings]);

  const dataMap = useMemo(() => {
    const map = new Map<string, DataRow>();
    state.data.forEach((row) => {
      map.set(row.id, row);
    });
    return map;
  }, [state.data]);

  /** Helper function for text processing */
  const processPlaceholderText = useCallback(
    (
      ph: PlaceholderObject,
      phKey: string,
      row: DataRow,
      certificateId: string,
      mapping?: PlaceholderMapping,
    ): string => {
      const defaultText = defaultPlaceholderTextRef.current[phKey] ?? "";

      if (ph.variant === "certificate-id" || ph.variant === "qr-code") {
        return certificateId;
      }

      if (state.mode === "manual") {
        return row[phKey] || defaultText;
      }

      if (mapping?.columns.length) {
        const joinedText = mapping.columns
          .map((col) => row[col] || "")
          .filter(Boolean)
          .join(mapping.separator);
        return joinedText || defaultText;
      }

      return defaultText;
    },
    [state.mode],
  );

  const generateCertificate: AppContextState["generateCertificate"] =
    useCallback(
      async (props) => {
        const { rowId, id, multiplier = 1 } = props;

        if (!templateLoaded) throw new Error("Template not loaded");
        if (!rowId) throw new Error("No active row ID");

        const canvas = canvasRef.current;
        const artboard = artboardRef.current;
        if (!canvas || !artboard) {
          throw new Error(
            "Certificate page area not found. Open the template in the editor and Save again so the artboard is stored correctly.",
          );
        }

        const row = dataMap.get(rowId);
        if (!row) throw new Error("Row not found");

        const certificateId = id || clientUniqueId();
        const objects = canvas.getObjects();
        canvas.discardActiveObject();

        objects.forEach((obj, index) => {
          if (!(obj as PlaceholderObject).isPlaceholder) return;

          const ph = obj as PlaceholderObject;
          const phKey =
            ph.placeholderId ?? `${ph.variant || "default"}_${index}`;
          const mapping = mappingsMap.get(phKey);

          const newText = processPlaceholderText(
            ph,
            phKey,
            row,
            certificateId,
            mapping,
          );

          if (isText(ph) || isQR(ph)) {
            ph.set({ text: newText });
          }
        });

        const meta: MetaMappings = {
          recipientName: "",
          recipientEmail: "",
        };

        state.metaPlaceholders.forEach((metaPh) => {
          const mapping = mappingsMap.get(metaPh.key);
          let value = "";

          if (state.mode === "manual") {
            value = row[metaPh.key] || "";
          } else if (mapping?.columns.length) {
            value = mapping.columns
              .map((col) => row[col] || "")
              .filter(Boolean)
              .join(mapping.separator);
          }

          if (metaPh.key === "recipientName") meta.recipientName = value;
          else if (metaPh.key === "recipientEmail") meta.recipientEmail = value;
        });

        canvas.requestRenderAll();

        // Canvas rendering
        const artboardLeft = artboard.left! - artboard.width! / 2;
        const artboardTop = artboard.top! - artboard.height! / 2;
        const originalVpt = canvas.viewportTransform!;

        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

        try {
          const snapshot = canvas.toDataURL({
            format: "png",
            left: artboardLeft,
            top: artboardTop,
            width: artboard.width,
            height: artboard.height,
            multiplier,
            quality: 1,
            enableRetinaScaling: false,
          });

          const url = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const tempCanvas = document.createElement("canvas");
              tempCanvas.width = img.width;
              tempCanvas.height = img.height;
              const ctx = tempCanvas.getContext("2d")!;
              ctx.drawImage(img, 0, 0);
              tempCanvas.toBlob(
                (blob) => {
                  if (blob) resolve(URL.createObjectURL(blob));
                  else reject(new Error("Failed to create blob"));
                },
                "image/png",
                1,
              );
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = snapshot;
          });

          return { url, meta };
        } finally {
          canvas.setViewportTransform(originalVpt);
        }
      },
      [
        templateLoaded,
        mappingsMap,
        dataMap,
        state.mode,
        state.metaPlaceholders,
        processPlaceholderText,
      ],
    );

  const loadTemplate = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    return axios
      .get(`/api/templates/id/${id}`, { timeout: 10000 })
      .then(async ({ data: templateData }) => {
        const hiddenCanvas = document.createElement("canvas");
        const fabricCanvas = new Canvas(hiddenCanvas);

        applyDefaults();
        return fabricCanvas.loadFromJSON(templateData).then(() => {
          const objects = fabricCanvas.getObjects();
          const canvasPlaceholders: Placeholder[] = [];

          objects.forEach((obj: FabricObject, index: number) => {
            if ((obj as PlaceholderObject).isPlaceholder) {
              const ph = obj as PlaceholderObject;
              const key =
                ph.placeholderId ?? `${ph.variant || "default"}_${index}`;
              const placeholderName =
                ph.placeholderName || `Placeholder ${index + 1}`;
              const isMappable = !NON_MAPPABLE_VARIANTS.has(ph.variant);

              if (isMappable && !(key in defaultPlaceholderTextRef.current)) {
                defaultPlaceholderTextRef.current[key] =
                  (ph as FabricText).text || "";
              }

              canvasPlaceholders.push({
                key,
                label: placeholderName,
                mappable: isMappable,
                isMeta: false,
                isCustom: ph.variant.toLowerCase() === "custom",
              });
            }
          });

          const artboard = findArtboardOrFallback(fabricCanvas);

          canvasRef.current = fabricCanvas;
          artboardRef.current = artboard;
          setPlaceholders(
            Object.freeze([...canvasPlaceholders, ...META_PLACEHOLDERS]),
          );
          setTemplateLoaded(true);

          dispatch({ type: "SET_PLACEHOLDERS", payload: canvasPlaceholders });
          stopSuccess("Template loaded");
        });
      })
      .catch((err: unknown) => {
        const message = axios.isAxiosError(err)
          ? `Template fetch failed: ${err.response?.status || "Network error"} - ${err.message}`
          : err instanceof Error
            ? err.message
            : "Failed to load template";

        dispatch({ type: "SET_ERROR", payload: message });
        console.error("Template loading error:", err);
        stopError("Something went wrong. Please try again.");
      })
      .finally(() => {
        dispatch({ type: "SET_LOADING", payload: false });
        loadingRef.current = false;
      });
  }, [id, stopError, stopSuccess]);

  useEffect(() => {
    loadTemplate();

    return () => {
      if (canvasRef.current) {
        canvasRef.current.dispose();
        canvasRef.current = null;
      }
      artboardRef.current = null;
      setTemplateLoaded(false);
    };
  }, [loadTemplate]);

  // Stable context values
  const contextValues = useMemo(
    (): AppContextState => ({
      state,
      dispatch,
      placeholders,
      generateCertificate,
    }),
    [state, placeholders, generateCertificate],
  );

  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};
export const useData = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
