import crypto from "crypto";

// Simple, dependency-free password hashing using PBKDF2.
// Stored format: `${saltHex}:${hashHex}`
export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100_000, 32, "sha256");
  return `${salt}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const parts = passwordHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, expectedHashHex] = parts;

  const actualHash = crypto.pbkdf2Sync(password, salt, 100_000, 32, "sha256");
  const expectedHash = Buffer.from(expectedHashHex, "hex");

  // Ensure constant-time comparison
  if (actualHash.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(actualHash, expectedHash);
}

