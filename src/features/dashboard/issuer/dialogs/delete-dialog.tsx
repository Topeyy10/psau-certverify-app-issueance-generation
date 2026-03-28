import { memo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Template } from "@/types";

const DeleteDialog = memo<
  React.ComponentProps<typeof AlertDialog> & {
    name: Template["name"] | undefined;
    onDelete: () => void;
  }
>((props) => {
  const { name, onDelete, ...rest } = props;
  if (!name) return null;

  return (
    <AlertDialog {...rest}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-bold underline">{name ?? ""}</span> template
            and remove it from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
DeleteDialog.displayName = "DeleteDialog";

export { DeleteDialog };
