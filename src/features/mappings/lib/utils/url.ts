export const createUrlManager = () => {
  const generatedUrls = new Set<string>();

  const cleanupUrl = (url: string) => {
    try {
      URL.revokeObjectURL(url);
      generatedUrls.delete(url);
    } catch (err) {
      console.warn("Failed to revoke URL:", err);
    }
  };

  const cleanupAllUrls = () => {
    generatedUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (err) {
        console.warn("Failed to revoke URL during cleanup:", err);
      }
    });
    generatedUrls.clear();
  };

  const addUrl = (url: string) => {
    generatedUrls.add(url);
  };

  return { cleanupUrl, cleanupAllUrls, addUrl };
};
