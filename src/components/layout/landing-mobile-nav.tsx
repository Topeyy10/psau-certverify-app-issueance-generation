import { LogInIcon, MenuIcon, UserPlusIcon } from "lucide-react";
import Link from "next/link";
import { BRAND_CONFIG, Brand } from "@/components/shared/branding";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AnchorLinks } from "@/constants";

const MobileNavigation = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="xl:hidden">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent
        data-mobile="true"
        className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
        style={
          {
            "--sidebar-width": "18rem",
          } as React.CSSProperties
        }
        side="right"
      >
        <SheetHeader>
          <Brand size="xs" boxed roundness="sm" showTagline />
          <div className="sr-only">
            <SheetTitle>{BRAND_CONFIG.name}</SheetTitle>
            <SheetDescription>{BRAND_CONFIG.tagline}</SheetDescription>
          </div>
        </SheetHeader>
        <nav className="flex flex-col space-y-1 px-4">
          {AnchorLinks.map(({ href, label, icon: Icon }) => (
            <SheetClose key={href} asChild>
              <Button variant="ghost" className="justify-start" asChild>
                <a href={href}>
                  <Icon className="me-3" />
                  <span>{label}</span>
                </a>
              </Button>
            </SheetClose>
          ))}
        </nav>

        <SheetFooter className="flex-col gap-2 px-4 pb-6">
          <Button variant="secondary" className="w-full" asChild>
            <Link href="/login">
              <LogInIcon className="me-3" />
              Log In
            </Link>
          </Button>
          <Button className="w-full" asChild>
            <Link href="/signup">
              <UserPlusIcon className="me-3" />
              Sign Up
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export { MobileNavigation };
