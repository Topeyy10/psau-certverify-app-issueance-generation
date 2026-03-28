import { type FabricImage, filters } from "fabric";
import { useCanvasStore } from "../stores";
import { isImage } from "../types";
import { useUpdateProperty } from "./shapes";

export const useResetImage = () => {
  const update = useUpdateProperty();

  return () => {
    const { objects, canvas } = useCanvasStore.getState();
    if (!isImage(objects) || !canvas) return;

    objects.filters = [];
    objects.applyFilters([]);
    canvas.requestRenderAll();

    // Trigger global reactivity update
    update({});
  };
};

export const makeFilterSelector = (
  filterType: keyof typeof filters,
  prop: string = filterType.toLowerCase(),
  scale: number = 100,
) => {
  return (s: any) => {
    const obj = s.objects;
    if (!isImage(obj)) return 0;

    const img = obj as FabricImage;
    const filter = img.filters.find((f) => f.type === filterType) as any;
    const value = filter?.[prop] ?? 0;

    return Math.round(value * scale);
  };
};

export const makeFilterHandler = (
  filterType: keyof typeof filters,
  prop: string = filterType.toLowerCase(),
  scale: number = 100,
) => {
  return (value: number) => {
    const { objects, canvas } = useCanvasStore.getState();
    if (!isImage(objects) || !canvas) return {};

    const img = objects as FabricImage;
    const normalized = value / scale;

    let filterInstance = img.filters.find((f) => f.type === filterType) as any;

    if (!filterInstance) {
      const FilterClass = (filters as any)[filterType];
      filterInstance = new FilterClass({ [prop]: normalized });
      img.filters.push(filterInstance);
    } else {
      filterInstance[prop] = normalized;
    }

    img.applyFilters(img.filters);
    canvas.requestRenderAll();

    return {};
  };
};
