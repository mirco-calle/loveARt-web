// ============================================
// GENERIC STORAGE UTILITIES
// ============================================

/**
 * Wipes the entire localStorage — use on logout to ensure no
 * residual keys remain (theme, etc.)
 */
export const clearAll = () => localStorage.clear();

/**
 * Get item from localStorage with type safety
 */
export const getStorageItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item) as T;
  } catch {
    return item as unknown as T;
  }
};

/**
 * Set item in localStorage
 */
export const setStorageItem = (key: string, value: any) => {
  const val = typeof value === "string" ? value : JSON.stringify(value);
  localStorage.setItem(key, val);
};
