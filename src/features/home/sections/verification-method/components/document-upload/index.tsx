import { UploadIcon } from "lucide-react";
import { Card } from "../shared/card";
import { UploadSlot } from "./upload-slot";

const UploadMethod = () => {
  return (
    <Card
      icon={UploadIcon}
      title="Document Upload"
      description="Upload a digital copy of your certificate to confirm its authenticity."
    >
      <UploadSlot />
    </Card>
  );
};

export { UploadMethod };
