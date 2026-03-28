import { QrCodeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const BRAND_CONFIG = {
  name: "PSAU CertVerify",
  tagline: "Certificate Validation System",
  icon: QrCodeIcon,
};

export type BrandVariant = "icon-only" | "stacked" | "horizontal";
export type BrandSize = "xs" | "sm" | "md" | "lg" | "xl";
export type BrandRoundness = BrandSize | "none" | "full";
export type BrandAlignment = "left" | "center" | "right";

interface SizeConfigProps {
  icon: string;
  name: string;
  tagline: string;
  gap: string;
}

const sizeClass: Record<BrandSize, SizeConfigProps> = {
  xs: {
    icon: "size-6",
    name: "text-base font-semibold",
    tagline: "text-xs",
    gap: "gap-2",
  },
  sm: {
    icon: "size-10",
    name: "text-lg font-semibold",
    tagline: "text-sm",
    gap: "gap-2.5",
  },
  md: {
    icon: "size-12",
    name: "text-xl font-bold",
    tagline: "text-base",
    gap: "gap-3",
  },
  lg: {
    icon: "size-14",
    name: "text-2xl font-bold",
    tagline: "text-base",
    gap: "gap-3.5",
  },
  xl: {
    icon: "size-16",
    name: "text-3xl font-bold",
    tagline: "text-xl",
    gap: "gap-4",
  },
};

const roundnessClass: Record<BrandRoundness, string> = {
  none: "rounded-none",
  xs: "rounded-xs",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

interface BrandProps {
  alignment?: BrandAlignment;
  boxed?: boolean;
  className?: string;
  forceInvert?: boolean;
  roundness?: BrandRoundness;
  showTagline?: boolean;
  size?: BrandSize;
  variant?: BrandVariant;
}

const Brand = (props: BrandProps) => {
  const {
    alignment = "center",
    boxed = false,
    className,
    forceInvert = false,
    roundness = "md",
    showTagline = false,
    size = "md",
    variant = "horizontal",
  } = props;

  const IconComponent = BRAND_CONFIG.icon;
  const config = sizeClass[size];

  const IconElement = () => {
    const iconColor = boxed
      ? forceInvert
        ? "text-primary"
        : "text-primary-foreground"
      : forceInvert
        ? "text-primary-foreground"
        : "text-primary";

    const iconElement = (
      <IconComponent className={cn(config.icon, iconColor)} />
    );

    if (boxed) {
      const boxBg = forceInvert ? "bg-primary-foreground" : "bg-primary";

      return (
        <div
          className={cn(
            "flex items-center justify-center p-1",
            boxBg,
            roundnessClass[roundness],
            roundness === "full" && "p-2",
          )}
        >
          {iconElement}
        </div>
      );
    }

    return iconElement;
  };

  if (variant === "icon-only") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <IconElement />
      </div>
    );
  }

  if (variant === "stacked") {
    const alignmentClasses = {
      left: "items-start text-left",
      center: "items-center text-center",
      right: "items-end text-right",
    };

    return (
      <div
        className={cn(
          "flex flex-col",
          alignmentClasses[alignment],
          config.gap,
          className,
        )}
      >
        <IconElement />
        <div
          className={cn(
            "flex flex-col -space-y-1 leading-none tracking-tight",
            alignmentClasses[alignment],
            forceInvert && "text-primary-foreground",
          )}
        >
          <span className={cn("whitespace-nowrap", config.name)}>
            {BRAND_CONFIG.name}
          </span>
          {showTagline && (
            <span
              className={cn(
                "whitespace-nowrap",
                config.tagline,
                forceInvert ? "text-muted" : "text-muted-foreground",
              )}
            >
              {BRAND_CONFIG.tagline}
            </span>
          )}
        </div>
      </div>
    );
  }

  // horizontal variant (default)
  return (
    <div className={cn("flex items-center", config.gap, className)}>
      <IconElement />
      <div
        className={cn(
          "flex flex-col -space-y-1 leading-none tracking-tight",
          forceInvert && "text-primary-foreground",
        )}
      >
        <span className={cn("whitespace-nowrap", config.name)}>
          {BRAND_CONFIG.name}
        </span>
        {showTagline && (
          <span
            className={cn(
              "whitespace-nowrap",
              config.tagline,
              forceInvert ? "text-muted" : "text-muted-foreground",
            )}
          >
            {BRAND_CONFIG.tagline}
          </span>
        )}
      </div>
    </div>
  );
};

export { Brand };
