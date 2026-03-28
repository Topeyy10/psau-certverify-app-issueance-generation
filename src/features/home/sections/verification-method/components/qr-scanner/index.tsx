import { ScanQrCodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "../shared/card";
import { ScannerStatus } from "./scanner-icon-status";
import { ScannerSlot } from "./scanner-slot";

const ScanMethod = () => {
  return (
    <Card
      icon={ScanQrCodeIcon}
      title="QR Code Scan"
      description="Scan your certificate's QR code to confirm its validity."
    >
      <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 px-4 py-8 text-center">
        <ScannerStatus />
        <p className="mb-2 text-sm leading-tight text-pretty">
          Scan QR code to verify certificate
        </p>
        <ScannerSlot button={<Button size="sm">Start Scanning</Button>} />
      </div>
    </Card>
  );
};

export { ScanMethod };
