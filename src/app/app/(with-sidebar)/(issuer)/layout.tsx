import type React from "react";
import { RoleProvider } from "@/contexts";

const IssuerLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => (
  <RoleProvider role="issuer">{children}</RoleProvider>
);

export default IssuerLayout;
