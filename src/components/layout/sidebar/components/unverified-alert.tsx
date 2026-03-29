"use client";

import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { sendVerificationEmail } from "@/aactions/auth";
import { LoadingButton } from "@/components/shared/loading-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSidebar } from "@/components/ui/sidebar";
import { useToastStore } from "@/stores/toast-store";

const UnverifiedAlert = ({ status }: { status: boolean }) => {
  const [sending, setSending] = useState(false);
  const { state } = useSidebar();

  const { start, error, success } = useToastStore(
    useShallow((s) => ({
      start: s.start,
      error: s.stopError,
      success: s.stopSuccess,
    })),
  );

  const handleResend = useCallback(async () => {
    setSending(true);
    try {
      start("Sending email");
      const result = await sendVerificationEmail();
      if (!result?.ok) {
        error(result?.error ?? "Could not send email. Check SMTP settings on the server.");
      } else {
        success("Resent email succesfully");
      }
    } catch (err) {
      console.error(err);
      error("Failed to send verification email. Please try again.");
    } finally {
      setSending(false);
    }
  }, [start, error, success]);

  if (state === "collapsed") return null;

  if (!status) {
    return (
      <Alert className="gap-y-2">
        <AlertTitle>Verify Your Email</AlertTitle>
        <AlertDescription>
          Your email is not verified. Please verify it first.
        </AlertDescription>
        <LoadingButton
          className="bg-sidebar-primary text-sidebar-primary-foreground col-start-2 shadow-none"
          label="Send Verification"
          loading={sending}
          onClick={handleResend}
          size="sm"
        />
      </Alert>
    );
  }

  return null;
};

export { UnverifiedAlert };
