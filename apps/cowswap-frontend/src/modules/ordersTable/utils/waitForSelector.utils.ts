export interface WaitForSelectorOptions {
  /** Max wait in ms. Default: 30_000. */
  timeout?: number
  /** Default: `'attached'`. */
  state?: WaitForSelectorState
  /** Poll interval in ms. Default: 50. */
  polling?: number
}

export type WaitForSelectorState = 'attached' | 'detached' | 'visible' | 'hidden'

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_POLLING_MS = 50

/** Retries `document.querySelector` until `state` matches or `timeout` elapses (Playwright-like API). */
export async function waitForSelector(selector: string, options: WaitForSelectorOptions = {}): Promise<Element | null> {
  const { timeout = DEFAULT_TIMEOUT_MS, state = 'attached', polling = DEFAULT_POLLING_MS } = options

  if (typeof document === 'undefined') {
    return null
  }

  const deadline = Date.now() + timeout

  return new Promise((resolve) => {
    const check = (): void => {
      const element = document.querySelector(selector)

      if (matchesState(element, state)) {
        resolve(state === 'attached' || state === 'visible' ? element : null)
        return
      }

      if (Date.now() >= deadline) {
        resolve(null)
        return
      }

      setTimeout(check, polling)
    }

    check()
  })
}

function isVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement)) {
    return false
  }

  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
}

function matchesState(element: Element | null, state: WaitForSelectorState): boolean {
  switch (state) {
    case 'attached':
      return element !== null
    case 'detached':
      return element === null
    case 'visible':
      return element !== null && isVisible(element)
    case 'hidden':
      return element === null || !isVisible(element)
  }
}
