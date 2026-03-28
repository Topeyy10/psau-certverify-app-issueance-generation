import {
  Code2Icon,
  EyeIcon,
  FileUpIcon,
  LinkIcon,
  TableIcon,
  TagIcon,
} from "lucide-react";

export const MAPPINGS_META = {
  dataInput: {
    icon: FileUpIcon,
    title: "Data Upload",
    description: "Manually input or import CSV/Excel data to get started.",
  },
  dataPreview: {
    icon: TableIcon,
    title: "Data Preview",
    description: "Review your uploaded data in a paginated, 10-row table view.",
  },
  column: {
    icon: TagIcon,
    title: "Columns",
    description:
      "Drag columns from your uploaded data to map them to template fields or meta fields.",
  },
  fieldMapping: {
    icon: LinkIcon,
    title: "Field Mapping",
    description:
      "Map imported data columns to template placeholders with custom separators.",
  },
  metaMapping: {
    icon: Code2Icon,
    title: "Meta Mappings",
    description:
      "Map fields here for internal use. This data won't show up on the final output.",
  },
  livePreview: {
    icon: EyeIcon,
    title: "Live Preview",
    description:
      "See a real-time preview of your template with all mapped data.",
  },
};
