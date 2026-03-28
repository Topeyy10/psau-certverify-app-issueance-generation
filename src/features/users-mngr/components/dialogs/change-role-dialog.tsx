// src/components/dialogs/change-role-dialog.tsx

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

// Define the valid user roles
type UserRole = "admin" | "issuer" | "user";

interface ChangeRoleDialogProps {
  selectedUserRole: {
    id: string;
    role: UserRole; // The intended new role
  } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChangeRoleDialog({
  selectedUserRole,
  onConfirm,
  onCancel,
}: ChangeRoleDialogProps) {
  const isOpen = !!selectedUserRole;

  const newRole = selectedUserRole?.role || "user";
  const userId = selectedUserRole?.id || "N/A";

  const descriptionText = useMemo(
    () => (
      <p>
        Are you sure you want to change the role of user ID{" "}
        <span className="font-bold">{userId}</span> to{" "}
        <span className="font-bold">{newRole.toUpperCase()}</span>? This will
        affect their permissions across the application.
      </p>
    ),
    [userId, newRole],
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Role Change</DialogTitle>
          <DialogDescription>
            {isOpen
              ? descriptionText
              : "Internal Error: No role change selected."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          {/* Button to cancel the action */}
          <Button variant="outline" onClick={onCancel}>
            No, Keep Current Role
          </Button>
          {/* Button to confirm the action */}
          <Button
            // Use 'destructive' only for assigning Admin role for visual emphasis
            variant={newRole === "admin" ? "destructive" : "default"}
            onClick={onConfirm}
          >
            Yes, Change to {newRole.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
