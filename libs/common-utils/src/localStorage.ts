/**
 * SSR-safe raw `localStorage.getItem`. Returns null when localStorage is unavailable
 * (e.g. server-side, or when accessed during module evaluation before the DOM exists).
 */
export function getLocalStorageItem(key: string): string | null {
  if (typeof localStorage === 'undefined') return null

  return localStorage.getItem(key)
}

export function loadJsonFromLocalStorage<T>(key: string): T | null {
  const data = localStorage.getItem(key)

  return data ? JSON.parse(data) : null
}

export function setJsonToLocalStorage(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data))
}
