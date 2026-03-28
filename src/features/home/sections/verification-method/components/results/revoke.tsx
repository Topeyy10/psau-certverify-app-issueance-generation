import { CircleXIcon } from "lucide-react";
import { formatToReadableTimestamp } from "@/lib/utils";
import type { CertificateData } from "../../types/verification.types";

const RevokedDialog = ({
  data,
}: {
  data: NonNullable<CertificateData["data"]>;
}) => (
  <div className="flex flex-col items-center justify-center">
    <CircleXIcon
      size={85}
      className="stroke-background text-destructive"
      fill="currentColor"
    />
    <p
      id="verification-description"
      className="text-destructive text-xl font-bold"
    >
      Certificate is Revoked
    </p>
    <div className="border-destructive/30 bg-destructive/20 text-destructive mt-5 w-full rounded-md border p-3 text-sm">
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        <span className="font-semibold">Holder Name:</span>
        <span>{data.holderName}</span>
        <span className="font-semibold">Certificate ID:</span>
        <span>{data.id}</span>
        <span className="font-semibold">Issuance Date:</span>
        <span>{formatToReadableTimestamp(data.issuanceDate)}</span>
        <span className="font-semibold">Issuer ID:</span>
        <span>{data.issuer}</span>
      </div>
      <p className="mt-3 text-center text-xs">
        This certificate has been revoked. Please contact the admin office for
        details.
      </p>
    </div>
  </div>
);
RevokedDialog.displayName = "RevokeUI";

export { RevokedDialog as RevokedDialogBody };
