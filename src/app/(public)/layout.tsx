import { PublicRouteProvider } from "@/contexts";

const PublicRouteLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return <PublicRouteProvider>{children}</PublicRouteProvider>;
};

export default PublicRouteLayout;
