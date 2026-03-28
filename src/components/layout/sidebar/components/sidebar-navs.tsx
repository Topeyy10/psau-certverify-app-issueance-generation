"use client";

import type { User } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/contexts";
import { SidebarNavigation } from "../config";

const getUserNavigation = (user: User) => {
  const roles = user?.labels || ["user"];

  if (roles.includes("admin")) return SidebarNavigation.admin;
  if (roles.includes("issuer")) return SidebarNavigation.issuer;

  return SidebarNavigation.user;
};

const NavItem = React.memo(
  ({
    href,
    label,
    icon: Icon,
    pathname,
    onClick,
  }: {
    href: string;
    label: string;
    icon: React.FC<any>;
    pathname: string;
    onClick: () => void;
  }) => (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={pathname === href || pathname.startsWith(`${href}/`)}
        tooltip={label}
        onClick={onClick}
        asChild
      >
        <Link href={href}>
          <Icon />
          {label}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ),
);

const SidebarNavs = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const { user } = useUser();
  const NavLinks = getUserNavigation(user);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarMenu>
          {NavLinks.map((link) => (
            <NavItem
              key={link.href}
              {...link}
              pathname={pathname}
              onClick={() => setOpenMobile(false)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
};

export { SidebarNavs };
