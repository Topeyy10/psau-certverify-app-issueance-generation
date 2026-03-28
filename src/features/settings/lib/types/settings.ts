export interface AuthSessionItem {
  $id: string;
  $createdAt: string;
  ip: string;
  countryName: string;
  clientName?: string;
  clientVersion?: string;
  osName?: string;
  osVersion?: string;
  deviceName?: string;
  current: boolean;
}

export interface Settings {
  preferences: {
    theme: string;
    fontFamily: string;
    autoSave: boolean;
    checkerboardBackground: boolean;
    autoClipToArtboard: boolean;
    enableDragToMove: boolean;
  };
  security: {
    sessions: AuthSessionItem[];
  };
}

interface PartialSecurity {
  sessionIds: string[];
}

interface PartialAccount {
  profilePhoto: File;
  password: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  email: {
    email: string;
    password: string;
  };
  profile: {
    fullName: string;
  };
}

export interface SettingsAction {
  isLoading: boolean;
  updatePreferences: (data: Partial<Settings["preferences"]>) => Promise<void>;
  updateSecurity: (
    data: Partial<PartialSecurity>,
    type: keyof Settings["security"],
  ) => Promise<void>;
  updateAccount: (
    data: Partial<PartialAccount>,
    type: keyof PartialAccount,
  ) => Promise<void>;
}

export interface SettingsState extends Settings, SettingsAction {}
