type InjectedWidgetGlobal = typeof globalThis & {
  __COW_SWAP_WIDGET_MODE__?: boolean
}

export function setInjectedWidgetMode(isWidgetMode: boolean): void {
  ;(globalThis as InjectedWidgetGlobal).__COW_SWAP_WIDGET_MODE__ = isWidgetMode
}

/**
 * Detects if the current page is running in widget mode
 * by checking for a direct widget-mode flag or '/widget' in the URL hash.
 */
export function isInjectedWidget(): boolean {
  if ((globalThis as InjectedWidgetGlobal).__COW_SWAP_WIDGET_MODE__) return true

  if (typeof window === 'undefined') return false

  try {
    const hash = new URL(window.location.href).hash
    return hash.split('/').includes('widget')
  } catch {
    return false
  }
}
