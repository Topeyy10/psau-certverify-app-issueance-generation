import { LockIcon, Settings2Icon, UserIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import {
  AccountSettings,
  AppPreferences,
  DisplaySettings,
  SessionsList,
} from "./components/settings";
import { TabsTrigger } from "./components/ui/tabs-trigger";
import { useSettingsStore } from "./lib/stores/use-settings-store";

const SettingsPage = () => {
  return (
    <Tabs defaultValue="account">
      <TabsList className="w-full mb-5">
        <TabsTrigger value="account">
          <UserIcon />
          Account
        </TabsTrigger>
        <TabsTrigger value="security">
          <LockIcon />
          Security
        </TabsTrigger>
        <TabsTrigger value="preferences">
          <Settings2Icon />
          Preferences
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <AccountSettings />
        </div>
      </TabsContent>
      <TabsContent value="security">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <SessionsList />
        </div>
      </TabsContent>
      <TabsContent value="preferences">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <DisplaySettings />
          <AppPreferences />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export { SettingsPage, useSettingsStore };
