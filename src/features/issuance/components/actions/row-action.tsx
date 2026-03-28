import {
  CheckCircleIcon,
  CircleXIcon,
  CopyIcon,
  DownloadIcon,
  InfoIcon,
  MoreHorizontalIcon,
  SendIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Certificate } from "@/types";
import { useCertificatesActions } from "../../lib/context/data-provider";

const RowAction = ({ certificate }: { certificate: Certificate }) => {
  const { downloadSingle, updateStatus, sendToHolder } =
    useCertificatesActions();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(certificate.$id)}
        >
          <CopyIcon />
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => sendToHolder([certificate.$id])}>
          <SendIcon />
          Send To Holder
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => downloadSingle(certificate.$id, "pdf")}
        >
          <DownloadIcon />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => downloadSingle(certificate.$id, "jpg")}
        >
          <DownloadIcon />
          Download JPG
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={cn(
            "text-success focus:bg-success/10 dark:focus:bg-success/20 focus:text-success *:[svg]:!text-success",
          )}
          onClick={() => updateStatus("1", [certificate.$id])}
        >
          <CheckCircleIcon />
          Mark Valid
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus("0", [certificate.$id])}>
          <InfoIcon />
          Set Pending
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => updateStatus("-1", [certificate.$id])}
        >
          <CircleXIcon />
          Revoke
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { RowAction };
