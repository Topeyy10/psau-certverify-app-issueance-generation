// src/components/dialogs/ban-user-dialog.tsx

import { useMemo } from "react";
import { Button } from "@/components/ui/button"; // Ensure this path is correct
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Ensure this path is correct

interface BanUserDialogProps {
  selectedUserStatus: {
    id: string;
    status: boolean; // false = intended new state is BANNED, true = intended new state is ACTIVE/UNBANNED
  } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BanUserDialog({
  selectedUserStatus,
  onConfirm,
  onCancel,
}: BanUserDialogProps) {
  const isOpen = !!selectedUserStatus;

  const isIntendedBan = selectedUserStatus?.status === false;

  const actionText = isIntendedBan ? "ban" : "unban";
  const titleText = isIntendedBan ? "Confirm User Ban" : "Confirm User Unban";

  // Ensure we have data before creating the description
  const userId = selectedUserStatus?.id || "N/A";

  const descriptionText = useMemo(
    () =>
      isIntendedBan ? (
        <p>
          Are you sure you want to ban user ID{" "}
          <span className="font-bold">{userId}</span>? They will no longer be
          able to access their account.
        </p>
      ) : (
        <p>
          Are you sure you want to unban user ID{" "}
          <span className="font-bold">{userId}</span>? They will be able to
          access their account once again.
        </p>
      ),
    [userId],
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titleText}</DialogTitle>
          <DialogDescription>
            {isOpen ? descriptionText : "Internal Error: No user selected."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            No, Cancel
          </Button>
          <Button
            variant={isIntendedBan ? "destructive" : "default"}
            onClick={onConfirm}
          >
            Yes, {actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
