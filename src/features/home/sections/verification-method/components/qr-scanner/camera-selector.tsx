import { memo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { useScanner } from "../../hooks/use-scanner";

interface CameraSelectorProps
  extends Pick<
    ReturnType<typeof useScanner>,
    "cameras" | "selectedCameraID" | "switchCamera" | "isInitializing"
  > {}

const CameraSelector = memo((props: CameraSelectorProps) => {
  const { cameras, selectedCameraID, switchCamera, isInitializing } = props;
  if (cameras.length <= 1) return null;

  return (
    <div className="space-y-1">
      <Label htmlFor="camera-picker">Camera</Label>
      <Select
        value={selectedCameraID ?? ""}
        onValueChange={switchCamera}
        disabled={isInitializing}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a camera" />
        </SelectTrigger>
        <SelectContent>
          {cameras.map((cam) => (
            <SelectItem key={cam.id} value={cam.id}>
              {cam.label || `Camera ${cam.id.slice(0, 4)}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

export { CameraSelector };
