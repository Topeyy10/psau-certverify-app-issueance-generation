"use client";

import { FileSpreadsheet, PenLineIcon } from "lucide-react";
import { useCallback, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "../../lib/contexts/data-provider";
import { useAppActions } from "../../lib/hooks";
import type { InputMode } from "../../lib/types";
import { FileUpload, ManualInput } from "../controls";
import { MappingCardWrapper } from "../layout";

const DataInput = () => {
  const { state } = useData();
  const { setMode, clearData } = useAppActions();

  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<InputMode | null>(null);

  const handleTabChange = useCallback(
    (newMode: InputMode) => {
      if (newMode === state.mode) return;
      if (state.data.length > 0) {
        setPendingMode(newMode);
        setShowWarningDialog(true);
        return;
      }
      setMode(newMode);
    },
    [state.mode, state.data, setMode],
  );

  const handleConfirmSwitch = useCallback(() => {
    if (pendingMode) {
      clearData();
      setMode(pendingMode);
      setPendingMode(null);
    }
    setShowWarningDialog(false);
  }, [pendingMode, clearData, setMode]);

  const handleCancelSwitch = useCallback(() => {
    setPendingMode(null);
    setShowWarningDialog(false);
  }, []);

  return (
    <>
      <MappingCardWrapper group="dataInput">
        <Tabs
          value={state.mode}
          onValueChange={(value) => handleTabChange(value as InputMode)}
        >
          <TabsList className="w-full lg:h-12 mb-5">
            <TabsTrigger value="manual">
              <PenLineIcon />
              Manual Input
            </TabsTrigger>
            <TabsTrigger value="file">
              <FileSpreadsheet />
              File Upload
            </TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <ManualInput />
          </TabsContent>
          <TabsContent value="file">
            <FileUpload />
          </TabsContent>
        </Tabs>
      </MappingCardWrapper>

      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Input Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              You have existing data. Switching to{" "}
              {pendingMode === "file" ? "file upload" : "manual input"} mode
              will clear all current data. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSwitch}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleConfirmSwitch}>Clear Data & Switch</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { DataInput };
