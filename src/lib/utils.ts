import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";
import type { Shortcut } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatToRelativeTimestamp = (
  input: string | number | Date,
): string => {
  const now = new Date();
  const date = new Date(input);
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "in the future";

  const intervals = [
    { unit: "y", ms: 365 * 24 * 60 * 60 * 1000 },
    { unit: "mo", ms: 30 * 24 * 60 * 60 * 1000 },
    { unit: "w", ms: 7 * 24 * 60 * 60 * 1000 },
    { unit: "d", ms: 24 * 60 * 60 * 1000 },
    { unit: "h", ms: 60 * 60 * 1000 },
    { unit: "m", ms: 60 * 1000 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffMs / interval.ms);
    if (count >= 1) {
      return `${count}${interval.unit} ago`;
    }
  }

  return "just now";
};

export const formatToReadableTimestamp = (
  input: string | number | Date,
  month: Intl.DateTimeFormatOptions["month"] = "long",
): string => {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month,
    day: "numeric",
  });
};

export const formatRelativeDate = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 6);
  const lastYear = new Date(today);
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  // Format time in 12-hour format with AM/PM
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const timeString = timeFormatter.format(date);

  // Check if date is today
  if (date >= today) {
    return `Today at ${timeString}`;
  }

  // Check if date was yesterday
  if (date >= yesterday && date < today) {
    return `Yesterday at ${timeString}`;
  }

  // Check if date was within the last 6 days (shows day of week)
  if (date >= lastWeek) {
    const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
    return `${dayFormatter.format(date)} at ${timeString}`;
  }

  // Check if date was in the current year
  if (date.getFullYear() === now.getFullYear()) {
    const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
    });
    return `${monthDayFormatter.format(date)} at ${timeString}`;
  }

  // Date is from previous years
  const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${fullDateFormatter.format(date)} at ${timeString}`;
};

export const getInitials = (name?: string) => {
  if (!name || typeof name !== "string") {
    return "A";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const initials = words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase());

  return initials.join("");
};

export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

export const toKebabCase = (str: string): string => {
  return str
    .trim() // Remove leading/trailing whitespace
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s\-_]/g, "") // Remove special characters except spaces, dashes, underscores
    .replace(/[\s\-_]+/g, "-") // Replace spaces, dashes, underscores with single dash
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
};

export const throttle = <T extends (...args: never[]) => void>(
  func: T,
  limit: number,
): T & { cancel: () => void } => {
  let inThrottle: boolean;
  let lastArgs: Parameters<T> | null = null;

  const throttledFunction = ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  }) as T & { cancel: () => void };

  throttledFunction.cancel = () => {
    inThrottle = false;
    lastArgs = null;
  };

  return throttledFunction;
};

export const debounce = <T extends (...args: never[]) => void>(
  func: T,
  delay: number,
): T & { cancel: () => void } => {
  let timeoutId: NodeJS.Timeout | null = null;

  const debouncedFunction = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  }) as T & { cancel: () => void };

  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFunction;
};

export const base64ToBlob = (base64: string, mime: string) => {
  const byteString = atob(base64.split(",")[1] ?? base64); // remove prefix if exists
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
};

export const getKeyIndex = () => {
  return uuidv4();
};

export const createKeyboardShortcutListener = (
  shortcuts: Shortcut[],
): (() => void) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) {
      return;
    }

    const target = event.target as HTMLElement;
    if (
      target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT"
    ) {
      return;
    }

    // Iterate over all registered shortcuts
    for (const shortcut of shortcuts) {
      // Check if the primary key matches (case-insensitive for letters)
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      // Check for modifier keys
      const ctrlMatch = !!shortcut.hasCtrl === event.ctrlKey;
      const altMatch = !!shortcut.hasAlt === event.altKey;
      const shiftMatch = !!shortcut.hasShift === event.shiftKey;

      // If all conditions are met, execute the function
      if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
        event.preventDefault(); // Prevent default browser action for the shortcut
        shortcut.fn(event); // Execute the bound function
        return; // Execute only the first matching shortcut
      }
    }
  };

  // Register the single listener on the window
  window.addEventListener("keydown", handleKeyDown);

  // Return the cleanup function
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
};
