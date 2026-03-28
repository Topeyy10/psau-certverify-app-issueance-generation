"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./theme-provider";

const PublicRouteProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  useEffect(() => {
    document.body.style.removeProperty("font-family");
  }, []);

  return (
    <ThemeProvider defaultTheme="light" attribute="class" enableSystem={false}>
      <Toaster
        duration={8000}
        expand={false}
        position="top-center"
        style={{ fontFamily: "inherit" }}
        richColors
      />
      {children}
    </ThemeProvider>
  );
};

export { PublicRouteProvider };
