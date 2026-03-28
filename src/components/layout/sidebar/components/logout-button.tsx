"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { logOut } from "@/aactions/auth/logout.action";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToastStore } from "@/stores/toast-store";

const LogoutButton = () => {
  const { start, stop, error } = useToastStore(
    useShallow((s) => ({
      start: s.start,
      stop: s.stopSuccess,
      error: s.stopError,
    })),
  );

  const router = useRouter();

  const handleLogOut = useCallback(async () => {
    try {
      start("Logging out");
      const result = await logOut();

      if (result && !result.ok) {
        error(result.error);
      } else {
        stop("Logged out successfully");
        router.push("/login");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred";
      error(message);
    }
  }, [router, start, stop, error]);

  return (
    <DropdownMenuItem onClick={handleLogOut}>
      <LogOutIcon />
      Log out
    </DropdownMenuItem>
  );
};

export { LogoutButton };
