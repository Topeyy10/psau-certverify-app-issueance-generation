import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { KeyIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useUser } from "@/contexts";
import { SETTINGS_META } from "@/features/settings/lib/constants/settings";
import { useSettingsStore } from "@/features/settings/lib/stores/use-settings-store";
import { type PasswordSettings, passwordSchema } from "../schema";

const PasswordChangeForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useUser();
  const { isLoading, updateAccount } = useSettingsStore(
    useShallow((s) => ({
      isLoading: s.isLoading,
      updateAccount: s.updateAccount,
    })),
  );
  const form = useForm<PasswordSettings>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleDialogClose = useCallback(
    (open: boolean) => {
      if (!isLoading) {
        setShowPassword(open);
        if (!open) form.reset();
      }
    },
    [isLoading, form],
  );

  const handleSubmit = useCallback(
    async (data: PasswordSettings) => {
      if (!user) return;

      try {
        await updateAccount({ password: { ...data } }, "password");
        handleDialogClose(false);
      } catch (e) {
        console.error("Password update failed", e);
      }
    },
    [updateAccount, user, handleDialogClose],
  );

  if (!user) return null;

  return (
    <>
      <Button variant="outline" onClick={() => setShowPassword(true)}>
        <KeyIcon />
        Change Password
      </Button>

      <Dialog open={showPassword} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{SETTINGS_META.password.title}</DialogTitle>
            <DialogDescription>
              {SETTINGS_META.password.description}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleSubmit)}
              noValidate
            >
              <FormField
                control={form.control}
                name="currentPassword"
                className="space-y-1"
                label="Current Password"
              >
                {(field) => (
                  <PasswordInput placeholder="Enter old password" {...field} />
                )}
              </FormField>
              <FormField
                control={form.control}
                name="newPassword"
                className="space-y-1"
                label="New Password"
                errorPosition="bottom"
              >
                {(field) => (
                  <PasswordInput
                    placeholder="Enter new password"
                    maxLength={128}
                    {...field}
                  />
                )}
              </FormField>
              <FormField
                control={form.control}
                name="confirmPassword"
                className="space-y-1"
                label="Confirm Password"
                errorPosition="bottom"
              >
                {(field) => (
                  <PasswordInput
                    placeholder="Confirm new password"
                    maxLength={128}
                    {...field}
                  />
                )}
              </FormField>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  Update Password
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { PasswordChangeForm };
