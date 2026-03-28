import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { getLoggedInUser } from "@/aactions/auth";
import { getUserSettings } from "@/aactions/profile/get-profile-settings";
import { FontLoader } from "@/components/shared/font-loader";
import { SettingsProvider, ThemeProvider, UserProvider } from "@/contexts";
import { DefaultSettingsValue } from "@/features/settings/lib/default-settings";
import type { Settings } from "@/features/settings/lib/types";
import "../fonts.css";

const PrivateRouteLayout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  let settings: Settings | undefined;
  const res = await getUserSettings();
  if (res.ok) settings = res.data;

  return (
    <UserProvider initialUser={user}>
      <ThemeProvider
        defaultTheme={DefaultSettingsValue.preferences.theme}
        attribute="class"
        enableSystem
      >
        <FontLoader />
        <SettingsProvider initialSettings={settings}>
          <Toaster
            duration={8000}
            expand={false}
            position="bottom-right"
            richColors
            style={{ fontFamily: "inherit" }}
          />
          {children}
        </SettingsProvider>
      </ThemeProvider>
    </UserProvider>
  );
};

export default PrivateRouteLayout;
