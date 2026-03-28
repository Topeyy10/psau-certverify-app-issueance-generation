"use client";

import { Separator } from "@/components/ui/separator";
import { SettingsCard } from "../../ui/settings-card-wrapper";
import {
  EmailChangeForm,
  PasswordChangeForm,
  ProfileInfoForm,
  ProfilePhotoForm,
} from "./forms";

export const AccountSettings = () => (
  <SettingsCard group="account">
    <div className="space-y-6">
      <ProfilePhotoForm />
      <Separator />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PasswordChangeForm />
        <EmailChangeForm />
      </div>
      <Separator />
      <ProfileInfoForm />
    </div>
  </SettingsCard>
);
