import {
  AlignCenterHorizontalIcon,
  AlignCenterVerticalIcon,
  AlignEndHorizontalIcon,
  AlignEndVerticalIcon,
  AlignStartHorizontalIcon,
  AlignStartVerticalIcon,
} from "lucide-react";

export const OBJECT_ALIGNMENTS = [
  {
    position: "left",
    icon: AlignStartVerticalIcon,
    label: "Left",
  },
  {
    position: "center",
    icon: AlignCenterVerticalIcon,
    label: "Center",
  },
  {
    position: "right",
    icon: AlignEndVerticalIcon,
    label: "Right",
  },
  {
    position: "top",
    icon: AlignStartHorizontalIcon,
    label: "Top",
  },
  {
    position: "middle",
    icon: AlignCenterHorizontalIcon,
    label: "Middle",
  },
  {
    position: "bottom",
    icon: AlignEndHorizontalIcon,
    label: "Bottom",
  },
] as const;
