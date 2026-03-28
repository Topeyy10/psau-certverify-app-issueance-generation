/** Cookie name for the auth session secret (Mongo-backed; not tied to Appwrite). */
export function getSessionCookieName(): string {
  return (
    process.env.SESSION_COOKIE_NAME ??
    process.env.APPWRITE_COOKIE_NAME ??
    "aw-certverify"
  );
}
