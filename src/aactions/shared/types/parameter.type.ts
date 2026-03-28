export interface WithCacheProps<Args extends unknown[], T> {
  fn: (...args: Args) => Promise<T>;
  staticTag: string;
  revalidate: number;
  tagGenerator?: (...args: Args) => string[] | Promise<string[]>;
  keyPartsGenerator?: (...args: Args) => string[] | Promise<string[]>; // Optional
}

export interface WithRetryProps<T> {
  fn: () => Promise<T>;
  maxAttempts?: number;
  delay?: number;
}
