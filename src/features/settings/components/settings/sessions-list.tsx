"use client";

import type { AuthSessionItem } from "../../lib/types";
import { CircleOffIcon } from "lucide-react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatRelativeDate } from "@/lib/utils";
import { useSettingsStore } from "../../lib/stores/use-settings-store";
import { SettingsCard } from "../ui/settings-card-wrapper";

/** Helper */
const formatSession = (session: AuthSessionItem): string => {
  const browser =
    session.clientName && session.clientVersion
      ? `${session.clientName} ${session.clientVersion}`
      : session.clientName || null;

  const os =
    session.osName && session.osVersion
      ? `${session.osName} ${session.osVersion}`
      : session.osName || null;

  const device = session.deviceName || null;

  if (browser && os) return `${browser} on ${os}`;
  if (browser) return browser;
  if (os) return `on ${os}`;
  if (device) return device;
  return "Unknown device";
};

/** UI */
const SessionProp = memo<{ label: string; value?: string }>(
  ({ label, value }) => (
    <>
      <span className="text-muted-foreground">{label}:</span>
      <span className="mb-2 sm:mb-0">{value}</span>
    </>
  ),
);

const SessionBlock = ({
  session,
  canLogout,
  onLogout,
}: {
  session: AuthSessionItem;
  canLogout?: boolean;
  onLogout?: (id: string) => void;
}) => (
  <div key={session.$id} className="bg-card border rounded-md p-2">
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[auto_1fr] items-start gap-x-2 lg:gap-x-4 text-sm">
        <SessionProp
          label="First Accessed"
          value={formatRelativeDate(session.$createdAt)}
        />
        <SessionProp label="IP Address" value={session.ip} />
        <SessionProp label="Location" value={session.countryName} />
        <SessionProp
          label="Browser and Device"
          value={formatSession(session)}
        />
      </div>
      {canLogout && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onLogout?.(session.$id)}
        >
          Log Out
        </Button>
      )}
    </div>
  </div>
);

/** Main Components */

const SessionsList = () => {
  const hasSession = useSettingsStore((s) => s.security.sessions.length > 0);

  return (
    <SettingsCard group="session">
      {hasSession ? <Sessions /> : <NoSession />}
    </SettingsCard>
  );
};

const NoSession = () => (
  <div className="flex flex-col items-center justify-center gap-4">
    <CircleOffIcon className="size-(--text-4xl)" />
    <p className="text-lg font-bold">No Active Session</p>
  </div>
);

const Sessions = () => {
  const { update, sessions } = useSettingsStore(
    useShallow((s) => ({
      update: s.updateSecurity,
      sessions: s.security.sessions,
    })),
  );

  const handleLogout = async (ids: string | string[]) => {
    const id: string[] = Array.isArray(ids) ? ids : ids ? [ids] : [];
    if (ids.length === 0) return;
    await update({ sessionIds: id }, "sessions");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p>You're currently logged in on this device</p>
        <SessionBlock session={sessions[0]} />
      </div>

      {sessions.length > 1 && (
        <>
          <Separator />
          <div className="space-y-2">
            <p>Logins on other devices</p>
            <ScrollArea className="pr-2 h-60 contain-strict">
              <div className="space-y-3">
                {sessions.slice(1).map((s) => (
                  <SessionBlock
                    key={s.$id}
                    session={s}
                    canLogout
                    onLogout={handleLogout}
                  />
                ))}

                <Button
                  className="w-full"
                  variant="default"
                  size="sm"
                  onClick={() =>
                    handleLogout(sessions.slice(1).map((s) => s.$id))
                  }
                >
                  Log out these sessions
                </Button>
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
};

export { SessionsList };
