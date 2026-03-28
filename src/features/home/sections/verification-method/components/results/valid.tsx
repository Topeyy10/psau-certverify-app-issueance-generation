import { CircleCheckIcon } from "lucide-react";
import { formatToReadableTimestamp } from "@/lib/utils";
import type { CertificateData } from "../../types/verification.types";

const ValidDialog = ({
  data,
}: {
  data: NonNullable<CertificateData["data"]>;
}) => (
  <div className="flex flex-col items-center justify-center">
    <CircleCheckIcon
      size={85}
      className="stroke-background text-green-800 dark:text-green-400"
      fill="currentColor"
    />
    <p
      id="verification-description"
      className="text-xl font-bold text-green-800 dark:text-green-400"
    >
      Certificate is Valid
    </p>
    <div className="mt-5 w-full rounded-md border border-green-800/30 bg-green-800/20 p-3 text-sm text-green-800 dark:border-green-400/30 dark:bg-green-400/20 dark:text-green-400">
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
    </div>
  </div>
);
ValidDialog.displayName = "ValidUI";

export { ValidDialog as ValidDialogBody };
