import {
  FileTextIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  WholeWordIcon,
} from "lucide-react";
import type { RouteLink } from "@/types";
import type { PageMetaMap } from "../types/types";

export const issuerConfig: RouteLink[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    href: "/app/certificates",
    label: "Certificates",
    icon: FileTextIcon,
  },
  { href: "/app/mapping", label: "Data Mapping", icon: WholeWordIcon },
  { href: "/app/settings", label: "Settings", icon: SettingsIcon },
];

export const issuerPageMeta: PageMetaMap = {
  "/app/dashboard": {
    title: "Dashboard",
    description: "Manage your templates and certificates",
  },
  "/app/certificates": {
    title: "Certificate Issuance",
    description: "Manage and track all issued certificates",
  },
  "/app/mapping": {
    title: "Data Mapping & Certificate Generation",
    description: "Choose how to issue certificates - import or enter manually",
  },
  "/app/settings": {
    title: "Settings",
    description: "Customize preferences and appearance",
  },
};
