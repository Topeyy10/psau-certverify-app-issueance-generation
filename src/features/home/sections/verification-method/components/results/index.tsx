"use client";

import { useShallow } from "zustand/react/shallow";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useVerifyStore } from "../../store/verifyStore";
import { InvalidDialogBody } from "./invalid";
import { RevokedDialogBody } from "./revoke";
import { ValidDialogBody } from "./valid";

const ResultsDialog = () => {
  const { results, isActive, hideDialog } = useVerifyStore(
    useShallow((s) => ({
      results: s.results,
      isActive: s.displayResults,
      hideDialog: s.hideDialog,
    })),
  );

  return (
    <AlertDialog open={isActive} onOpenChange={hideDialog}>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Verification Results</AlertDialogTitle>
          <AlertDialogDescription aria-describedby="verification-description" />
        </AlertDialogHeader>
        {!results ||
        !results.validity ||
        (results.status !== "1" && results.status !== "-1") ? (
          <InvalidDialogBody id={results?.id} />
        ) : results.status === "1" ? (
          <ValidDialogBody data={results.data!} />
        ) : (
          <RevokedDialogBody data={results.data!} />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="w-full">Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
ResultsDialog.displayName = "ResultsDialog";

export { ResultsDialog };
