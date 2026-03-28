import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { FormField } from "@/components/shared/form-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useUser } from "@/contexts";
import { SETTINGS_META } from "@/features/settings/lib/constants/settings";
import { useSettingsStore } from "@/features/settings/lib/stores/use-settings-store";
import { getInitials } from "@/lib/utils";
import { type ProfilePhoto, profilePhotoSchema } from "../schema";

const ProfilePhotoForm = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const { user, refreshUser } = useUser();
  const { isLoading, updateAccount } = useSettingsStore(
    useShallow((s) => ({
      isLoading: s.isLoading,
      updateAccount: s.updateAccount,
    })),
  );
  const form = useForm<ProfilePhoto>({
    resolver: zodResolver(profilePhotoSchema),
  });

  const resetForm = () => {
    form.reset();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleDialogClose = useCallback(
    (open: boolean) => {
      if (!isLoading) {
        setShowProfile(open);
        if (!open) resetForm();
      }
    },
    [isLoading, resetForm],
  );

  const handleSubmit = useCallback(
    async (data: ProfilePhoto) => {
      if (!user) return;

      try {
        await updateAccount({ profilePhoto: data.file }, "profilePhoto");
        refreshUser();
        handleDialogClose(false);
      } catch (e) {
        console.error("Profile photo update failed", e);
      }
    },
    [updateAccount, refreshUser, user, handleDialogClose],
  );

  const onFileChange = (
    file: File | null,
    onChange: (val: File | null) => void,
  ) => {
    if (preview) URL.revokeObjectURL(preview);
    onChange(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  if (!user) return null;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Avatar className="size-25">
          <AvatarImage
            src={
              (user.prefs as { avatarFileId?: string })?.avatarFileId
                ? `/api/avatars?fileId=${(user.prefs as { avatarFileId?: string }).avatarFileId}`
                : undefined
            }
            alt={user.name}
          />
          <AvatarFallback className="text-4xl font-bold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="text-center sm:text-left flex-1">
          <h3 className="font-semibold text-lg leading-none line-clamp-1">
            {user.name}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => setShowProfile(true)}
          >
            <CameraIcon /> Change Photo
          </Button>
        </div>
      </div>

      <Dialog open={showProfile} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{SETTINGS_META.photo.title}</DialogTitle>
            <DialogDescription>
              {SETTINGS_META.photo.description}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField control={form.control} name="file" showError={false}>
                {(field) => (
                  <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    onChange={(e) =>
                      onFileChange(e.target.files?.[0] ?? null, field.onChange)
                    }
                  />
                )}
              </FormField>

              <Avatar className="size-32 mx-auto">
                <AvatarImage
                  src={preview ?? undefined}
                  alt="Preview"
                  className="object-cover object-center"
                />
                <AvatarFallback className="text-4xl font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <p className="text-sm text-destructive text-center">
                {form.formState.errors.file?.message}
              </p>

              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => inputFileRef.current?.click()}
              >
                <CameraIcon /> Choose Photo
              </Button>

              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Upload
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ProfilePhotoForm };
