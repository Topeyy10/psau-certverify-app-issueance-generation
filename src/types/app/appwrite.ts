import type { DefaultDocument } from "@/aactions/shared/types";

export type UserRole = "admin" | "issuer" | "user" | null;

export type PromiseError = { error: string };

export type User = import("@/aactions/shared/types").User;

/** Legacy alias — Appwrite removed; shape matches list endpoints. */
export type Document = DefaultDocument;
