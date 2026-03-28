"use client";

import { CameraIcon, Loader2Icon } from "lucide-react";
import { useVerifyStore } from "../../store/verifyStore";

const ScannerStatus = () => {
  const processing = useVerifyStore((s) => s.processing);

  if (processing) {
    return <Loader2Icon className="size-9 animate-spin" />;
  } else {
    return <CameraIcon className="size-9" />;
  }
};

export { ScannerStatus };
