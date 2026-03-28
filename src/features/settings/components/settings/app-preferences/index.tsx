"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FieldPath, useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { FormField } from "@/components/shared/form-field";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/contexts";
import { useUpdateSettings } from "@/features/settings/hooks/use-update-settings";
import { useSettingsStore } from "@/features/settings/lib/stores/use-settings-store";
import type { Settings } from "@/features/settings/lib/types";
import { SaveButton } from "../../ui/save-button";
import { SettingsCard } from "../../ui/settings-card-wrapper";
import {
  type AppPreferences,
  appPreferencesSchema,
} from "./preferences.schema";

const ToggleFields: Record<
  keyof Omit<Settings["preferences"], "theme" | "fontFamily">,
  { label: string; description: string }
> = {
  autoSave: {
    label: "Auto Save",
    description: "Automatically save your work every 5 minutes.",
  },
  checkerboardBackground: {
    label: "Checkerboard Background",
    description: "Show a checkerboard pattern for transparent areas.",
  },
  autoClipToArtboard: {
    label: "Auto Clip to Artboard",
    description: "Automatically crop content to the artboard boundaries.",
  },
  enableDragToMove: {
    label: "Drag to Move Panels",
    description: "Enable dragging to rearrange interface panels and toolbars.",
  },
};

const AppSettings = () => {
  const { role } = useUser();

  const { isLoading, update, ...defaultValues } = useSettingsStore(
    useShallow((s) => ({
      isLoading: s.isLoading,
      update: s.updatePreferences,

      autoSave: s.preferences.autoSave,
      checkerboardBackground: s.preferences.checkerboardBackground,
      autoClipToArtboard: s.preferences.autoClipToArtboard,
      enableDragToMove: s.preferences.enableDragToMove,
    })),
  );

  const form = useForm<AppPreferences>({
    resolver: zodResolver(appPreferencesSchema),
    defaultValues,
  });

  const handleSubmit = useUpdateSettings<AppPreferences>({
    defaultValues,
    update,
  });

  if (role !== "issuer") return null;

  return (
    <SettingsCard group="preferences">
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          {Object.entries(ToggleFields).map(([name, props]) => (
            <FormField
              key={name}
              control={form.control}
              className="flex items-center sm:items-start gap-3"
              name={name as FieldPath<AppPreferences>}
              {...props}
            >
              {(field) => (
                <Switch
                  onCheckedChange={field.onChange}
                  checked={field.value}
                />
              )}
            </FormField>
          ))}
          <Separator />
          <SaveButton control={form.control} loading={isLoading} />
        </form>
      </Form>
    </SettingsCard>
  );
};

export { AppSettings as AppPreferences };
