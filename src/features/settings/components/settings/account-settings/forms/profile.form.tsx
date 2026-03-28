import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { FormField } from "@/components/shared/form-field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts";
import { useUpdateSettings } from "@/features/settings/hooks/use-update-settings";
import { useSettingsStore } from "@/features/settings/lib/stores/use-settings-store";
import { SaveButton } from "../../../ui/save-button";
import { type Profile, profileSchema } from "../schema";

const ProfileInfoForm = () => {
  const { user, role, refreshUser } = useUser();
  const { isLoading, updateAccount } = useSettingsStore(
    useShallow((s) => ({
      isLoading: s.isLoading,
      updateAccount: s.updateAccount,
    })),
  );

  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name,
    },
  });

  const handleSubmit = useUpdateSettings<Profile>({
    defaultValues: { fullName: user?.name ?? "" },
    update: (d) => {
      if (!user) return Promise.resolve();
      return updateAccount({ profile: { ...d } }, "profile");
    },
    onSuccess: refreshUser,
  });

  if (!user) return null;

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <FormField
          control={form.control}
          name="fullName"
          className="space-y-1"
          label="Full Name"
          errorPosition="bottom"
        >
          {(field) => (
            <Input
              type="text"
              placeholder="Enter full name"
              maxLength={128}
              {...field}
            />
          )}
        </FormField>

        <div className="space-y-1">
          <Label htmlFor="userIdInput">User ID</Label>
          <Input
            id="userIdInput"
            type="text"
            className="capitalize"
            value={user.$id}
            readOnly
            disabled
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="roleInput">Role</Label>
          <Input
            id="roleInput"
            type="text"
            className="capitalize"
            value={role ?? "user"}
            readOnly
            disabled
          />
          <p className="text-sm text-muted-foreground">
            Roles can only be changed by admins
          </p>
        </div>

        <SaveButton control={form.control} loading={isLoading} />
      </form>
    </Form>
  );
};

export { ProfileInfoForm };
