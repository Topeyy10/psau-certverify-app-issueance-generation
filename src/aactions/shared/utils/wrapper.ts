import { unstable_cache } from "next/cache";
import type { WithCacheProps, WithRetryProps } from "../types";

export function withCache<Args extends unknown[], T>({
  fn,
  staticTag,
  revalidate,
  tagGenerator,
  keyPartsGenerator,
}: WithCacheProps<Args, T>) {
  type WrappedArgs = [...Args, refresh?: boolean];

  let cachedFn: ((...args: Args) => Promise<T>) | null = null;

  return async (...fullArgs: WrappedArgs) => {
    const lastArg = fullArgs[fullArgs.length - 1];
    const isRefreshFlag = typeof lastArg === "boolean";
    const refresh = isRefreshFlag && (lastArg as boolean);

    const originalArgs = (
      isRefreshFlag ? fullArgs.slice(0, -1) : fullArgs
    ) as Args;

    // Generate cache key
    const keyParts = keyPartsGenerator
      ? await keyPartsGenerator(...originalArgs)
      : [staticTag];

    // Generate cache tags
    const tags = tagGenerator
      ? await tagGenerator(...originalArgs)
      : [staticTag];

    // Initialize cached function if not already set
    if (!cachedFn) {
      cachedFn = unstable_cache(fn, keyParts, {
        revalidate,
        tags,
      });
    }

    if (refresh) {
      // Call the function directly and update the cache
      const result = await fn(...originalArgs);

      // Re-create cachedFn to store the fresh result
      cachedFn = unstable_cache(async () => result, keyParts, {
        revalidate,
        tags,
      });
      return result;
    }

    return cachedFn(...originalArgs);
  };
}

export async function withRetry<T>({
  fn,
  maxAttempts = 3,
  delay = 100,
}: WithRetryProps<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
}
