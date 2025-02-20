/**
 * Detects if the current window is running inside an iframe
 * by comparing window.self with window.top
 */
export function isIframe(): boolean {
  return typeof window !== 'undefined' && window.self !== window.top
}
