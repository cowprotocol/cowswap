export function isInjectedWidget(): boolean {
  return window.location.hash.includes('/widget')
}
