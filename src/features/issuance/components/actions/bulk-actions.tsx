"use client";

import {
  CheckCircleIcon,
  CircleXIcon,
  DownloadIcon,
  SendIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useCertificatesActions,
  useCertificatesState,
} from "../../lib/context/data-provider";

const BulkActions = () => {
  const { updateStatus, bulkDownload, sendToHolder } = useCertificatesActions();
  const { rowSelection } = useCertificatesState();
  const selectedCount = Object.keys(rowSelection).length;

  if (selectedCount === 0) return null;

  return (
    <div className="sm:flex sm:justify-end">
      <div className="hidden sm:flex sm:flex-row items-center gap-x-3 gap-y-1">
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "w-full sm:w-fit",
            "text-success hover:bg-success/10 dark:hover:bg-success/20 hover:text-success *:[svg]:!text-success focus-visible:ring-success/20 dark:focus-visible:ring-success/40",
          )}
          onClick={() => updateStatus("1")}
        >
          <CheckCircleIcon />
          Mark Valid
        </Button>

        <Separator orientation="vertical" className="!h-5" />

        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "w-full sm:w-fit",
            "text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 hover:text-destructive *:[svg]:!text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
          )}
          onClick={() => updateStatus("-1")}
        >
          <CircleXIcon />
          Revoke
        </Button>

        <Separator orientation="vertical" className="!h-5" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full sm:w-fit">
              <DownloadIcon />
              Download as ZIP
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
            <DropdownMenuItem onClick={() => bulkDownload("jpg")}>
              JPG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => bulkDownload("pdf")}>
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="!h-5" />

        <Button
          variant="ghost"
          size="sm"
          className="w-full sm:w-fit"
          onClick={() => sendToHolder()}
        >
          <SendIcon />
          Send To Holders
        </Button>
      </div>

      <div className="sm:hidden grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-success hover:text-success hover:bg-success/10 dark:hover:bg-success/20 focus-visible:ring-success/20 dark:focus-visible:ring-success/40"
          onClick={() => updateStatus("1")}
        >
          <CheckCircleIcon />
          Mark Valid
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
          onClick={() => updateStatus("-1")}
        >
          <CircleXIcon />
          Revoke
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <DownloadIcon />
              Download as ZIP
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
            <DropdownMenuItem onClick={() => bulkDownload("jpg")}>
              JPG (ZIP)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => bulkDownload("pdf")}>
              PDF (ZIP)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={() => sendToHolder()}>
          <SendIcon />
          Send To Holders
        </Button>
      </div>
    </div>
  );
};

export { BulkActions };
