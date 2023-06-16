export function useIsStandaloneWidget() {
  return window.location.hash.includes('/widget')
}
