import type { LucideIcon } from "lucide-react";
import type React from "react";
import { toKebabCase } from "@/lib/utils";

interface SectionContainerProps {
  badgeIcon: LucideIcon;
  badgeText: string;
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const SectionContainer = (props: SectionContainerProps) => {
  const { badgeIcon: Icon, badgeText, id, title, subtitle, children } = props;
  const heroID = `${toKebabCase(id)}-text`;

  return (
    <section id={id} aria-describedby={heroID} className="odd:bg-secondary">
      <div className="mx-auto px-4 py-24 sm:max-w-6xl xl:py-32">
        <header className="mx-auto max-w-3xl space-y-3 text-center">
          {/* Badges */}
          <div className="[section:nth-child(even)_&]:bg-secondary [section:nth-child(odd)_&]:bg-background mx-auto mb-8 flex w-fit items-center space-x-3 rounded-full border px-4 py-2">
            <Icon />
            <span className="text-base font-semibold xl:text-lg">
              {badgeText}
            </span>
          </div>

          {/* Main Texts */}
          <h2 id={heroID} className="text-4xl font-bold md:text-5xl">
            {title}
          </h2>
          <p className="text-muted-foreground text-2xl leading-tight">
            {subtitle}
          </p>
        </header>

        {/* Main Content */}
        <div className="mt-15">{children}</div>
      </div>
    </section>
  );
};

export { SectionContainer };
