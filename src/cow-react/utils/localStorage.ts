export function setJsonToLocalStorage(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export function loadJsonFromLocalStorage<T>(key: string): T | null {
  const data = localStorage.getItem(key)

  return data ? JSON.parse(data) : null
}
