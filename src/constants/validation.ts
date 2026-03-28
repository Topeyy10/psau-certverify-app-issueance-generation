import type { PasswordRules } from "@/types";

export const CERTIFICATE_FILE = {
  ACCEPTED_TYPES: {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "application/pdf": [".pdf"],
  } as const,
  MAX_FILE: 1,
  MAX_FILE_SIZE: 10 * 1024 ** 2,
};

export const MAPPING_FILE = {
  ACCEPTED_TYPES: {
    "text/csv": [".csv"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
  } as const,
  MAX_FILE: 1,
  MAX_FILE_SIZE: 10 * 1024 ** 2,
};

export const PASSWORD_RULES: PasswordRules = {
  length: {
    min: 6,
    message: "Must be at least 6 characters",
  },
  lowercase: {
    regex: /[a-z]/,
    message: "Must contain at least one lowercase letter",
  },
  uppercase: {
    regex: /[A-Z]/,
    message: "Must contain at least one uppercase letter",
  },
  number: { regex: /\d/, message: "Must contain at least one number" },
  special: {
    regex: /[!@#$%^&*(),.?":{}|<>]/,
    message: "Must contain at least one special character",
  },
};
