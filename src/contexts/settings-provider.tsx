"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/features/settings/lib/stores/use-settings-store";
import type { Settings } from "@/features/settings/lib/types";

interface SettingsProps {
  children: React.ReactNode;
  initialSettings?: Settings;
}

const SettingsProvider = (props: SettingsProps) => {
  const { children, initialSettings } = props;
  const { setTheme } = useTheme();
  const isInitializedRef = useRef(false);

  const { theme, fontFamily } = useSettingsStore(
    useShallow((s) => ({
      theme: s.preferences.theme,
      fontFamily: s.preferences.fontFamily,
    })),
  );

  useEffect(() => {
    if (initialSettings && !isInitializedRef.current) {
      useSettingsStore.setState({ ...initialSettings });
      setTheme(initialSettings.preferences.theme);
      isInitializedRef.current = true;
    }
  }, [initialSettings, setTheme]);

  useEffect(() => {
    if (isInitializedRef.current) {
      setTheme(theme);
      document.body.style.fontFamily = fontFamily;
    }
  }, [theme, fontFamily, setTheme]);

  if (!isInitializedRef.current && !initialSettings) return null;

  return children;
};

export { SettingsProvider };
