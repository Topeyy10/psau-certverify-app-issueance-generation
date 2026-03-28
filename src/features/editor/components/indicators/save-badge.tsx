import { Badge } from "@/components/ui/badge";
import { useCanvasStore } from "../../lib/stores";

const SaveStatusBadge = () => {
  const status = useCanvasStore((s) => s.saveStatus);

  switch (status) {
    case "saved":
      return (
        <Badge className="max-w-15 min-w-15 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
          Saved
        </Badge>
      );
    case "saving":
      return (
        <Badge className="max-w-15 min-w-15" variant="secondary">
          Saving
        </Badge>
      );
    default:
      return (
        <Badge className="max-w-15 min-w-15" variant="outline">
          Unsaved
        </Badge>
      );
  }
};

export { SaveStatusBadge };
