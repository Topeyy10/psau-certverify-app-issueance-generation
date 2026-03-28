export function safeAction<Args extends unknown[], Return>(
  fn: (...args: Args) => Promise<Return>,
  getLoading: () => boolean,
): (...args: Args) => Promise<Return> {
  return (...args: Args): Promise<Return> => {
    if (getLoading()) {
      return Promise.reject(new Error("Action already in progress"));
    }
    return fn(...args);
  };
}
