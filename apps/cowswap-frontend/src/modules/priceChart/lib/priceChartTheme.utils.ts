export function getCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback

  return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}
