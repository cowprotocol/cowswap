import ms from 'ms.macro'
import { SWRConfiguration } from 'swr'

import { BASIC_MULTICALL_SWR_CONFIG } from '../consts'

let focusLostTimestamp: number | null = null
let listenersInitialized = false
const FOCUS_HIDDEN_DILAY = ms`20s`

function initializeFocusListeners(): void {
  if (listenersInitialized || typeof document === 'undefined') {
    return
  }

  listenersInitialized = true

  document.addEventListener('visibilitychange', () => {
    focusLostTimestamp = document.hidden ? Date.now() : null
  })

  window.addEventListener('blur', () => {
    focusLostTimestamp = Date.now()
  })

  window.addEventListener('focus', () => {
    focusLostTimestamp = null
  })
}

export const BFF_BALANCES_SWR_CONFIG: SWRConfiguration = {
  ...BASIC_MULTICALL_SWR_CONFIG,
  revalidateIfStale: true,
  refreshInterval: ms`8s`,
  errorRetryCount: 3,
  errorRetryInterval: ms`30s`,
  isPaused() {
    initializeFocusListeners()

    if (document.hasFocus()) {
      focusLostTimestamp = null
      return false
    }

    if (!focusLostTimestamp) {
      focusLostTimestamp = Date.now()
      return false
    }

    // Pause only if focus has been lost for more than ${FOCUS_HIDDEN_DILAY} seconds
    return Date.now() - focusLostTimestamp > FOCUS_HIDDEN_DILAY
  },
  onErrorRetry: (_: unknown, __key, config, revalidate, { retryCount }) => {
    const timeout = config.errorRetryInterval * Math.pow(2, retryCount - 1)

    setTimeout(() => revalidate({ retryCount }), timeout)
  },
}
