import { Ellipse, Line, Polygon, Rect, Triangle } from "fabric";
import {
  CircleIcon,
  MinusIcon,
  PentagonIcon,
  SquareIcon,
  TriangleIcon,
} from "lucide-react";
import type { ShapeConfig, ShapeType } from "../types/objects";

export const OBJECT_SIZE = 80;
export const OBJECT_STROKE = 3;

export const SHAPE_ITEMS = {
  square: { label: "Add Square", icon: SquareIcon },
  ellipse: { label: "Add Circle", icon: CircleIcon },
  triangle: { label: "Add Triangle", icon: TriangleIcon },
  line: { label: "Add Line", icon: MinusIcon },
  polygon: { label: "Add Polygon", icon: PentagonIcon },
} as const;

export const SHAPE_CONFIG: Record<ShapeType, ShapeConfig> = {
  square: {
    type: Rect,
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    strokeWidth: OBJECT_STROKE,
  },
  ellipse: {
    type: Ellipse,
    rx: OBJECT_SIZE / 2,
    ry: OBJECT_SIZE / 2,
    strokeWidth: OBJECT_STROKE,
  },
  triangle: {
    type: Triangle,
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    strokeWidth: OBJECT_STROKE,
  },
  line: {
    type: Line,
    points: [0, 0, OBJECT_SIZE, 0],
    strokeWidth: OBJECT_STROKE,
  },
  polygon: {
    type: Polygon,
    strokeWidth: OBJECT_STROKE,
  },
} as const;
