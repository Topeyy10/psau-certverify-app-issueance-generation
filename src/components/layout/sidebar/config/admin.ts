import { LayoutDashboardIcon, SettingsIcon, UsersIcon } from "lucide-react";
import type { RouteLink } from "@/types";
import type { PageMetaMap } from "../types/types";

export const adminConfig: RouteLink[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    href: "/app/users",
    label: "User Management",
    icon: UsersIcon,
  },
  {
    href: "/app/settings",
    label: "Settings",
    icon: SettingsIcon,
  },
];

export const adminPageMeta: PageMetaMap = {
  "/app/dashboard": {
    title: "Admin Dashboard",
    description: "System overview and activity monitoring",
  },
  "/app/users": {
    title: "User Management",
    description: "Manage application users and their accounts",
  },
  "/app/settings": {
    title: "Admin Settings",
    description: "Manage system configuration and preferences",
  },
};
