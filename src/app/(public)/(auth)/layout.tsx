import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/aactions/auth";

const AuthLayout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const user = await getLoggedInUser();
  if (user) redirect("/app/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center space-y-3 py-15">
      {children}
    </main>
  );
};

export default AuthLayout;
