"use client";

import type { SystemLog } from "@/aactions/shared/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelativeDate } from "@/lib/utils";

interface LogsTableDialogProps {
  selectedLog: SystemLog | null;
  onOpenChange: (open: boolean) => void;
}

const PreviewLogsDialog = ({
  selectedLog,
  onOpenChange,
}: LogsTableDialogProps) => {
  return (
    <Dialog open={!!selectedLog} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>System Log Details</DialogTitle>
          <DialogDescription>
            Detailed information about the selected system event.
          </DialogDescription>
        </DialogHeader>
        {selectedLog && (
          <ScrollArea className="max-h-[60vh] mt-4 pr-2">
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Action:</p>
                <span>{selectedLog.action}</span>
              </div>
              <div>
                <p className="text-muted-foreground">Raw Action:</p>
                <span className="whitespace-normal break-all">
                  {selectedLog.actionRaw}
                </span>
              </div>
              <div>
                <p className="text-muted-foreground">User ID:</p>
                <span>{selectedLog.userId}</span>
              </div>
              <div>
                <p className="text-muted-foreground">User Name:</p>
                <span>{selectedLog.userFullName}</span>
              </div>
              <div>
                <p className="text-muted-foreground">Resource:</p>
                <span>
                  {selectedLog.resourceType} ({selectedLog.resourceId})
                </span>
              </div>
              <div>
                <p className="text-muted-foreground">IP Address:</p>
                <span>{selectedLog.ipAddress}</span>
              </div>
              <div>
                <p className="text-muted-foreground">Browser:</p>
                <span>{selectedLog.browser}</span>
              </div>
              <div>
                <p className="text-muted-foreground">Operating System:</p>
                <span>{selectedLog.os}</span>
              </div>
              <div>
                <p className="text-muted-foreground">Device Type:</p>
                <span>{selectedLog.device}</span>
              </div>
              <div>
                <p className="text-muted-foreground">Timestamp:</p>
                <span>{formatRelativeDate(selectedLog.$createdAt)}</span>
              </div>
              <div>
                <p className="text-muted-foreground">Metadata:</p>
                <pre
                  className="bg-muted p-2 rounded-md overflow-x-auto mt-1 text-xs whitespace-pre-wrap break-words"
                  style={{ wordBreak: "break-all" }}
                >
                  {JSON.stringify(
                    JSON.parse(selectedLog.metadata || "{}"),
                    null,
                    3,
                  )}
                </pre>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { PreviewLogsDialog };
