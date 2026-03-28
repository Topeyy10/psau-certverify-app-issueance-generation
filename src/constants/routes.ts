import {
  CircleQuestionMarkIcon,
  GlobeIcon,
  HouseIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  StarIcon,
  WrenchIcon,
} from "lucide-react";
import type { RouteLink } from "@/types/ui/component.types";

/* ----------------------------- Landing Routes ----------------------------- */

export const AnchorLinks: RouteLink[] = [
  { href: "#home", label: "Home", icon: HouseIcon },
  { href: "#verification", label: "Verification", icon: ShieldCheckIcon },
  { href: "#how-it-works", label: "How It Works", icon: WrenchIcon },
  { href: "#features", label: "Features", icon: StarIcon },
  { href: "#faq", label: "FAQ", icon: CircleQuestionMarkIcon },
];

export const ResourceLinks: RouteLink[] = [
  {
    href: "https://psau.edu.ph/",
    label: "PSAU Official Website",
    icon: GlobeIcon,
  },
];

export const ContactLinks: RouteLink[] = [
  {
    href: "mailto:registrar@psau.edu.ph",
    label: "registrar@psau.edu.ph",
    icon: MailIcon,
  },
  {
    href: "tel:+63454580228",
    label: "(045) 458-0228",
    icon: PhoneIcon,
  },
  {
    href: "https://maps.app.goo.gl/8jXtxKSYXte5HxsP8",
    label: "Magalang, Pampanga, PH",
    icon: MapPinIcon,
  },
];
