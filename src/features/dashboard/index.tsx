"use client";
import { useUser } from "@/contexts";
import { AdminDashboard } from "./admin";
import { IssuerDashboard } from "./issuer";
import { UserDashboard } from "./user";

const DashboardPage = () => {
  const { role } = useUser();

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "issuer":
      return <IssuerDashboard />;
    case "user":
      return <UserDashboard />;
    default:
      return null;
  }
};

export { DashboardPage };
