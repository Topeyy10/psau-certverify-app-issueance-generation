"use client";

import { useEffect } from "react";
import { FONT_FAMILIES } from "@/constants";

const FontLoader = () => {
  useEffect(() => {
    FONT_FAMILIES.forEach((family) => {
      // Trigger loading of common variants
      document.fonts.load(`400 16px "${family}"`);
      document.fonts.load(`700 16px "${family}"`);
      document.fonts.load(`400 italic 16px "${family}"`);
      document.fonts.load(`700 italic 16px "${family}"`);
    });
  }, []);

  return null;
};

export { FontLoader };
