/**
 * Detects if the current page is running in widget mode
 * by checking for '/widget' in the URL hash
 */
export function isInjectedWidget(): boolean {
  return window.location.hash.includes('/widget')
}
