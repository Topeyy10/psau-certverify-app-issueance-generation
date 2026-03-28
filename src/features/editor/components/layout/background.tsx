import { useSettingsStore } from "@/features/settings";

const Background = () => {
  const isUsingCheckboard = useSettingsStore(
    (s) => s.preferences.checkerboardBackground,
  );

  if (!isUsingCheckboard) return null;

  return (
    <div className="absolute inset-0 bg-[repeating-conic-gradient(transparent_0_90deg,color-mix(in_oklab,var(--foreground),_transparent_90%)_0_180deg)] bg-[length:19px_19px]"></div>
  );
};

export { Background };
