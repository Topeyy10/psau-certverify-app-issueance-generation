"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { FormField } from "@/components/shared/form-field";
import { Form } from "@/components/ui/form";
import { RadioGroup } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FONT_FAMILIES } from "@/constants";
import { useUpdateSettings } from "@/features/settings/hooks/use-update-settings";
import { useSettingsStore } from "@/features/settings/lib/stores/use-settings-store";
import { SaveButton } from "../../ui/save-button";
import { SettingsCard } from "../../ui/settings-card-wrapper";
import {
  type DisplayPreferences,
  displayPreferencesSchema,
} from "./display.schema";
import { FontOptions } from "./font-options";

const DisplaySettings = () => {
  const { isLoading, update, ...defaultValues } = useSettingsStore(
    useShallow((s) => ({
      isLoading: s.isLoading,
      update: s.updatePreferences,
      theme: s.preferences.theme,
      fontFamily: s.preferences.fontFamily,
    })),
  );

  const form = useForm<DisplayPreferences>({
    resolver: zodResolver(displayPreferencesSchema),
    defaultValues,
  });

  const handleSubmit = useUpdateSettings<DisplayPreferences>({
    defaultValues,
    update,
  });

  return (
    <SettingsCard group="appearance">
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <FormField
            control={form.control}
            name="theme"
            label="Theme"
            className="flex flex-col gap-y-2 gap-x-3 sm:flex-row"
            description="Choose between light and dark mode"
          >
            {(field) => (
              <ToggleGroup
                variant="outline"
                type="single"
                className="w-full sm:w-fit flex-0"
                value={field.value}
                onValueChange={field.onChange}
              >
                <ToggleGroupItem value="system">
                  <SunMoonIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="light">
                  <SunIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="dark">
                  <MoonIcon />
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          </FormField>

          <FormField
            control={form.control}
            name="fontFamily"
            label="Font Family"
            className="space-y-2"
            description="Choose the font used throughout the application"
          >
            {(field) => (
              <ScrollArea className="h-40 px-2 border rounded-md contain-strict">
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="my-2"
                >
                  {["System", ...FONT_FAMILIES].map((font) => (
                    <FontOptions
                      key={font}
                      font={font}
                      isSelected={field.value === font}
                    />
                  ))}
                </RadioGroup>
              </ScrollArea>
            )}
          </FormField>
          <Separator />

          <SaveButton control={form.control} loading={isLoading} />
        </form>
      </Form>
    </SettingsCard>
  );
};

export { DisplaySettings };
