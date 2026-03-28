// src/components/dialogs/reset-password-dialog.tsx

import { useMemo } from "react";
import { Button } from "@/components/ui/button"; // Assuming this path for shadcn/ui button
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Assuming this path for shadcn/ui dialog components

interface ResetPasswordDialogProps {
  selectedUser: {
    id: string;
    userEmail: string;
  } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetPasswordDialog({
  selectedUser,
  onConfirm,
  onCancel,
}: ResetPasswordDialogProps) {
  const isOpen = !!selectedUser;
  const userId = selectedUser?.id || "N/A";
  const userEmail = selectedUser?.userEmail || "N/A";

  const descriptionText = useMemo(
    () => (
      <p>
        Are you sure you want to reset the password of user ID{" "}
        <span className="font-bold">{userId}</span>? A password reset link will
        be sent to <span className="font-bold">{userEmail}</span>. The user must
        then use this link to set a new password.
      </p>
    ),
    [userId, userEmail],
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Password Reset</DialogTitle>
          <DialogDescription>
            {isOpen ? descriptionText : "Internal Error: No user selected."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          {/* Button to cancel the action */}
          <Button variant="outline" onClick={onCancel}>
            No, Cancel
          </Button>
          {/* Button to confirm the action */}
          <Button
            variant="destructive" // Use destructive variant for security-related actions
            onClick={onConfirm}
          >
            Yes, Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
