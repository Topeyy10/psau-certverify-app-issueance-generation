import Link from "next/link";
import { Brand } from "@/components/shared/branding";
import { Button } from "@/components/ui/button";
import { AnchorLinks } from "@/constants";
import { MobileNavigation } from "./landing-mobile-nav";

const Header = () => {
  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-50 w-full border-b backdrop-blur-lg">
      <div className="mx-auto px-4 sm:max-w-7xl">
        <div className="flex h-15 items-center justify-between xl:h-20">
          <div className="min-w-xs">
            <Link href="/">
              <Brand boxed size="sm" roundness="sm" showTagline />
            </Link>
          </div>

          <nav className="hidden items-center space-x-8 xl:flex">
            {AnchorLinks.map(({ href, label }) => (
              <a href={href} key={href} className="group relative">
                <span>{label}</span>
                <span className="bg-primary absolute -bottom-1 left-1/2 h-0.5 w-0 transition-all group-hover:w-3/6"></span>
                <span className="bg-primary absolute right-1/2 -bottom-1 h-0.5 w-0 transition-all group-hover:w-3/6"></span>
              </a>
            ))}
          </nav>

          <div className="hidden min-w-3xs xl:block">
            <div className="flex items-center justify-end space-x-3">
              <Button variant="secondary" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>

          <MobileNavigation />
        </div>
      </div>
    </header>
  );
};

export { Header };
