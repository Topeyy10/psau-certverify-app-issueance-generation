"use client";

import { Brand } from "@/components/shared/branding";
import {
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const SidebarHeaderComponent = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <SidebarHeader>
      <SidebarMenuButton size="lg" onClick={toggleSidebar}>
        <Brand size="xs" showTagline boxed />
      </SidebarMenuButton>
    </SidebarHeader>
  );
};

export { SidebarHeaderComponent as SidebarHeader };
