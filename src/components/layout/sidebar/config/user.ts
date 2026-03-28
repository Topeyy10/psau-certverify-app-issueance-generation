import { LayoutDashboardIcon } from "lucide-react";
import type { RouteLink } from "@/types";
import type { PageMetaMap } from "../types/types";

export const userConfig: RouteLink[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
  },
];

export const userPageMeta: PageMetaMap = {
  "/app/dashboard": {
    title: "Thank You for Signing Up!",
    description:
      "Your account is currently under review by an administrator. Please read below for more information.",
  },
};
