import {
  CameraIcon,
  KeyIcon,
  LaptopIcon,
  LockIcon,
  MailIcon,
  PaletteIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";

export const SETTINGS_META = {
  account: {
    icon: UserIcon,
    title: "Account Settings",
    description: "Manage your personal info: email, password, and name.",
  },
  photo: {
    icon: CameraIcon,
    title: "Change Profile Photo",
    description: "Upload a new profile photo.",
  },
  password: {
    icon: KeyIcon,
    title: "Change Password",
    description: "Update your password. Requires current password.",
  },
  email: {
    icon: MailIcon,
    title: "Change Email",
    description:
      "Update your email. Requires current password and verification.",
  },
  preferences: {
    icon: SettingsIcon,
    title: "App Preferences",
    description: "Customize app behavior, and defaults.",
  },
  appearance: {
    icon: PaletteIcon,
    title: "Appearance",
    description: "Personalize your app's theme and fonts.",
  },
  "two-factor": {
    icon: LockIcon,
    title: "Two-Factor Authentication",
    description: "Enhance security with 2FA setup or management.",
  },
  session: {
    icon: LaptopIcon,
    title: "Active Sessions",
    description: "View and manage all active logins for your account.",
  },
} as const;
