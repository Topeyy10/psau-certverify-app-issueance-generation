import type React from "react";
import { RoleProvider } from "@/contexts";

const AdminLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <RoleProvider role="admin">{children}</RoleProvider>
);

export default AdminLayout;
