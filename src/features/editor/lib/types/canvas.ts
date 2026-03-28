import type {
  BasicTransformEvent,
  Canvas,
  FabricObject,
  Rect,
  TPointerEvent,
} from "fabric";

/* --------------------------------- Stores --------------------------------- */

export interface TemplateState {
  name: string | null;
  size: { w: number; h: number; label: string } | null;
  meta?: Record<string, unknown> | null;
  id: string | null;
  jsonId?: string | null;

  setName: (name: string) => void;
  setSize: (w: number, h: number, label: string) => void;
  setMeta: (meta: any) => void;
  setId: (id: string | null) => void;
  setJsonId: (id: string | null) => void;
}

export type SaveStatus = "unsaved" | "saving" | "saved";

export interface CanvasState {
  interactive: boolean;
  canvas: Canvas | null;
  artboard: Rect | null;
  artboardPreview: string | null;
  objects: FabricObject | null;
  saveStatus: SaveStatus;

  setInteractive: (interactive: boolean) => void;
  setCanvas: (canvas: Canvas | null) => void;
  setArtboard: (artboard: Rect | null) => void;
  setObjects: (objects: FabricObject | null) => void;
  setArtboardPreview: (src: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
}

/* --------------------------------- Fabric --------------------------------- */
export type FabricTransformEvent = BasicTransformEvent<TPointerEvent> & {
  target: FabricObject;
};

export interface Artboard extends Rect {
  isArtboard: boolean;
}

export interface SnapContext {
  canvas: Canvas;
  artboard: Rect;
  snapLinesRef: React.RefObject<FabricObject[]>;
}

export interface SnapLine {
  x?: number;
  y?: number;
  isVertical?: boolean;
  isSnapline?: boolean;
}
