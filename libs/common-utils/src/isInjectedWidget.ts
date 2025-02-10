/**
 * Detects if the current page is running in widget mode
 * by checking for '/widget' in the URL hash
 */
export function isInjectedWidget(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const hash = new URL(window.location.href).hash
    return hash.split('/').includes('widget')
  } catch {
    return false
  }
}
