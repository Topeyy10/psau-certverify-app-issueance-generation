import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon } from "lucide-react";
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
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts";
import { SETTINGS_META } from "@/features/settings/lib/constants/settings";
import { useSettingsStore } from "@/features/settings/lib/stores/use-settings-store";
import { type EmailSettings, emailSchema } from "../schema";

const EmailChangeForm = () => {
  const [showEmail, setShowEmail] = useState(false);
  const { user, refreshUser } = useUser();
  const { isLoading, updateAccount } = useSettingsStore(
    useShallow((s) => ({
      isLoading: s.isLoading,
      updateAccount: s.updateAccount,
    })),
  );
  const form = useForm<EmailSettings>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleDialogClose = useCallback(
    (open: boolean) => {
      if (!isLoading) {
        setShowEmail(open);
        if (!open) form.reset();
      }
    },
    [isLoading, form],
  );

  const handleSubmit = useCallback(
    async (data: EmailSettings) => {
      try {
        if (!user) return;

        await updateAccount({ email: { ...data } }, "email");
        refreshUser();

        handleDialogClose(false);
      } catch (e) {
        console.error("Email update failed", e);
      }
    },
    [updateAccount, user, refreshUser, handleDialogClose],
  );

  if (!user) return null;

  return (
    <>
      <Button variant="outline" onClick={() => setShowEmail(true)}>
        <MailIcon />
        Change Email
      </Button>

      <Dialog open={showEmail} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{SETTINGS_META.email.title}</DialogTitle>
            <DialogDescription>
              {SETTINGS_META.email.description}
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
                name="email"
                className="space-y-1"
                label="New Email"
                errorPosition="bottom"
              >
                {(field) => (
                  <Input
                    type="email"
                    placeholder="Enter new email"
                    {...field}
                  />
                )}
              </FormField>
              <FormField
                control={form.control}
                name="password"
                className="space-y-1"
                label="Password"
                errorPosition="bottom"
              >
                {(field) => (
                  <PasswordInput placeholder="Enter password" {...field} />
                )}
              </FormField>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  Update Email
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { EmailChangeForm };
