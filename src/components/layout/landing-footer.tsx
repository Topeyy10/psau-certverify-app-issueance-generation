import Link from "next/link";
import { memo } from "react";
import { Brand } from "@/components/shared/branding";
import { AnchorLinks, ContactLinks, ResourceLinks } from "@/constants";
import type { RouteLink } from "@/types";

const FooterLinks = memo<{
  title: string;
  items: RouteLink[];
  external?: boolean;
}>(({ title, items, external = false }) => (
  <div className="flex flex-col gap-y-3">
    <p className="font-bold">{title}</p>
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="group flex w-fit items-center space-x-3 opacity-80 hover:opacity-100"
        >
          <Icon className="size-4" />
          <span className="transition-[font-weight] group-hover:font-semibold">
            {label}
          </span>
        </a>
      ))}
    </nav>
  </div>
));
FooterLinks.displayName = "Footer Links";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="mx-auto px-4 py-25 sm:max-w-7xl">
      <div className="grid grid-cols-1 gap-x-12 gap-y-5 xl:grid-cols-[24rem_1fr_1fr_1fr]">
        {/* Branding */}
        <div className="flex flex-col space-y-3">
          <Link href="/">
            <Brand
              size="xl"
              variant="stacked"
              alignment="left"
              boxed
              showTagline
              forceInvert
            />
          </Link>
          <p className="text-sm">
            Official certificate validation system of Pampanga State
            Agricultural University
          </p>
        </div>

        {/* Links sections */}
        <FooterLinks title="Quick Links" items={AnchorLinks} />
        <FooterLinks title="PSAU Resources" items={ResourceLinks} external />
        <FooterLinks title="Contact PSAU" items={ContactLinks} external />
      </div>

      <hr className="bg-background my-10" />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <p className="text-sm">
          &copy; {new Date().getFullYear()}, Pampanga State Agricultural
          University
        </p>
      </div>
    </div>
  </footer>
);

export { Footer };
