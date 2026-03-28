import { CircleXIcon } from "lucide-react";
import type { CertificateData } from "../../types/verification.types";

const InvalidDialog = ({ id }: { id?: CertificateData["id"] }) => (
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
      Certificate is Invalid
    </p>
    <div className="border-destructive/30 bg-destructive/20 text-destructive mt-5 w-full rounded-md border p-3 text-center text-sm">
      <p>
        This certificate does not exist in our records. If you think this is a
        mistake, please report it to the admin office.
      </p>
      <div className="mt-3">
        <p className="font-semibold">ID Not found</p>
        <span className="text-xs opacity-70">{id ?? ""}</span>
      </div>
    </div>
  </div>
);
InvalidDialog.displayName = "InvalidUI";

export { InvalidDialog as InvalidDialogBody };
