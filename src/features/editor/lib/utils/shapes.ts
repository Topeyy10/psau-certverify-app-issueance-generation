import { Ellipse, FabricText, Line, Polygon, Rect, Triangle } from "fabric";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  PLACEHOLDER_CONFIG,
  QR_CODE_CONTROLS,
  QR_CODE_STYLE,
  VARIANT_CONFIG,
} from "../constants/placeholder";
import { OBJECT_SIZE, SHAPE_CONFIG } from "../constants/shapes";
import { useCanvasStore } from "../stores/canvas-store";
import type {
  CanvasState,
  CustomPolygon,
  Placeholder,
  PlaceholderVariant,
  ShapeObject,
  ShapeType,
} from "../types";
import { QRCode } from "./extensions";

/**
 * Generates a random hexadecimal color string in the format `#RRGGBB`.
 *
 * Each color component (red, green, blue) is randomly generated and converted to a two-digit hexadecimal value.
 * The resulting color string is always uppercase.
 *
 * @returns {string} A random hex color string (e.g., `#A1B2C3`).
 *
 * @see {@link https://stackoverflow.com/a/72691027} — Credits to Carsten Massmann for the original implementation idea.
 */
const generateRandomHexColor = (): string => {
  const col = [1, 2, 3].map((v) =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${col.join("").toUpperCase()}`;
};

/**
 * Creates a new shape object based on the specified type.
 *
 * This function generates a shape instance (Rect, Ellipse, Triangle, Line, or Polygon)
 * with random fill and stroke colors, using configuration values from `SHAPE_CONFIG`.
 * For polygons, it generates a regular polygon with 5 sides.
 *
 * @param type - The type of shape to create (e.g., 'square', 'ellipse', 'triangle', 'line', 'polygon').
 * @returns A newly created shape object with the specified properties.
 * @throws Will throw an error if the shape type is unsupported.
 */
export const createShape = (type: ShapeType): ShapeObject => {
  const cfg = SHAPE_CONFIG[type];
  const fill = generateRandomHexColor();
  const stroke = generateRandomHexColor();

  switch (type) {
    case "square":
      return new Rect({
        width: cfg.width,
        height: cfg.height,
        fill,
        stroke,
        strokeWidth: cfg.strokeWidth,
      });
    case "ellipse":
      return new Ellipse({
        rx: cfg.rx,
        ry: cfg.ry,
        fill,
        stroke,
        strokeWidth: cfg.strokeWidth,
      });
    case "triangle":
      return new Triangle({
        width: cfg.width,
        height: cfg.height,
        fill,
        stroke,
        strokeWidth: cfg.strokeWidth,
      });

    case "line": {
      const line = new Line(cfg.points! as [number, number, number, number], {
        stroke,
        strokeWidth: cfg.strokeWidth! * 3,
        lockScalingY: false,
      });
      line.setControlsVisibility({
        mt: false,
        mb: false,
        tl: false,
        tr: false,
        br: false,
        bl: false,
      });

      return line;
    }
    case "polygon": {
      const polygon = new Polygon(
        generateRegularPolygonPoints(5, OBJECT_SIZE / 2),
        {
          fill,
          stroke,
          strokeWidth: cfg.strokeWidth,
        },
      ) as CustomPolygon;
      polygon.sides = 5;
      polygon.starInset = undefined;
      polygon.polygonType = "regular";
      polygon.isPolygon = true;

      return polygon;
    }

    default:
      throw new Error(`Unsupported shape type: ${type}`);
  }
};

/**
 * Generates the vertex points for a regular polygon centered at the origin.
 *
 * @param sides - The number of sides (vertices) of the polygon.
 * @param radius - The distance from the center to each vertex.
 * @returns An array of points, each with `x` and `y` coordinates representing the vertices of the polygon.
 *
 * @remarks
 * The polygon is oriented such that the first vertex is at the top (negative y-axis).
 */
export const generateRegularPolygonPoints = (sides: number, radius: number) => {
  const points = [];
  const angle = (2 * Math.PI) / sides;

  for (let i = 0; i < sides; i++) {
    const x = radius * Math.sin(i * angle);
    const y = -radius * Math.cos(i * angle);
    points.push({ x, y });
  }
  return points;
};

/**
 * Generates the points for a star-shaped polygon.
 *
 * @param sides - The number of points (arms) of the star.
 * @param outerRadius - The radius from the center to the outermost points of the star.
 * @param inset - The proportion (0 to 1) that determines how far the inner points are inset from the outer radius.
 * @returns An array of points ({ x, y }) representing the vertices of the star polygon.
 *
 * The function alternates between outer and inner radii to create the star shape,
 * calculating each vertex's position based on the specified number of sides, outer radius, and inset.
 */
export const generateStarPoints = (
  sides: number,
  outerRadius: number,
  inset: number,
) => {
  const points = [];
  const innerRadius = outerRadius * (1 - inset);
  const angle = Math.PI / sides;

  for (let i = 0; i < 2 * sides; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const x = r * Math.sin(i * angle);
    const y = -r * Math.cos(i * angle);
    points.push({ x, y });
  }
  return points;
};

export const updatePolygonPoints = (
  sides: number = 5,
  inset: number = 0.2,
  isStar: boolean,
): Pick<CustomPolygon, "sides" | "starInset" | "polygonType"> & {
  points?: CustomPolygon["points"];
} => {
  const { canvas, objects } = useCanvasStore.getState();

  if (!canvas || !objects) {
    return {
      sides,
      starInset: isStar ? inset : undefined,
      polygonType: isStar ? "star" : "regular",
    };
  }

  const radius = objects.width / 2;
  const newPoints = isStar
    ? generateStarPoints(sides, radius, inset)
    : generateRegularPolygonPoints(sides, radius);

  return {
    points: newPoints,
    sides,
    starInset: isStar ? inset : undefined,
    polygonType: isStar ? "star" : "regular",
  };
};

export const createPlaceholder = async (
  variant: PlaceholderVariant,
): Promise<Placeholder> => {
  const isQrCode = variant === "qr-code";
  const config = isQrCode
    ? QR_CODE_STYLE
    : VARIANT_CONFIG[variant] || VARIANT_CONFIG.custom;

  let placeholder: QRCode | FabricText;

  if (isQrCode) {
    placeholder = new QRCode("0", { ...QR_CODE_STYLE, ...QR_CODE_CONTROLS });
  } else {
    placeholder = new FabricText(config.text, { ...PLACEHOLDER_CONFIG });
  }

  return Object.assign(placeholder, {
    placeholderId: uuidv4(),
    isPlaceholder: true,
    variant,
    placeholderName: isQrCode ? "QR Code" : config.name,
  }) as Placeholder;
};

export const updateProperty = (prop: string, value: any) => {
  const canvas = useCanvasStore.getState().canvas;
  const obj = useCanvasStore.getState().objects;
  if (!canvas || !obj) return;

  obj.set({ [prop]: value }).setCoords?.();
  canvas.renderAll?.();

  useCanvasStore.setState({
    lastUpdate: Date.now(),
  } as Partial<CanvasState>);
};

export const useUpdateProperty = (prop?: string) =>
  useCallback(
    (value: any) => {
      const canvas = useCanvasStore.getState().canvas;
      const obj = useCanvasStore.getState().objects;
      if (!canvas || !obj) return;

      // If prop is provided, treat value as single value for that property
      if (prop) {
        obj.set({ [prop]: value }).setCoords?.();
      } else {
        // If no prop provided, treat value as object with multiple properties
        obj.set(value).setCoords?.();
      }

      canvas.renderAll?.();
      useCanvasStore.setState({
        lastUpdate: Date.now(),
      } as Partial<CanvasState>);
    },
    [prop],
  );
