"use client";

import dynamic from "next/dynamic";
import type { ThemeProviderProps } from "next-themes";

const NextThemeProvider = dynamic(
  () => import("next-themes").then((e) => e.ThemeProvider),
  { ssr: false },
);

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => (
  <NextThemeProvider {...props}>{children}</NextThemeProvider>
);

export { ThemeProvider };
