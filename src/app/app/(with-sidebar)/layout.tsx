import {
  MetaBlock,
  SidebarHeader,
  SidebarNavs,
  SidebarUser,
} from "@/components/layout/sidebar";
import { Brand } from "@/components/shared/branding";
import {
  Sidebar,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" mobileSide="right">
        <SidebarHeader />
        <SidebarNavs />
        <SidebarUser />
        <SidebarRail />
      </Sidebar>
      <div className="w-full">
        <header className="bg-sidebar sticky top-0 z-50 border-b backdrop-blur-lg md:hidden">
          <div className="mx-auto flex items-center justify-between px-4 py-3 sm:max-w-7xl sm:px-6 lg:px-8">
            <Brand size="sm" showTagline boxed />
            <SidebarTrigger />
          </div>
        </header>
        <main className="mx-auto p-6 sm:max-w-7xl">
          <MetaBlock />
          <section>{children}</section>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
