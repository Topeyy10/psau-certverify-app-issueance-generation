import { randomBytes } from "node:crypto";

/** Hex id similar to Appwrite `ID.unique()` (16 bytes → 32 hex chars). */
export function uniqueId(): string {
  return randomBytes(16).toString("hex");
}
