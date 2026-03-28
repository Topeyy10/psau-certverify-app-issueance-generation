"use client";
import { notFound } from "next/navigation";
import type { UserRole } from "@/types";
import { useUser } from "./user-provider";

const RoleProvider = ({
  role: prefferedRole,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) => {
  const { role } = useUser();

  if (role === prefferedRole) {
    return children;
  } else {
    notFound();
  }
};

export { RoleProvider };
