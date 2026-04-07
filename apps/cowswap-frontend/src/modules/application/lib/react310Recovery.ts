/** Redux persist key for user slice (see persist config). */
export const REDUX_USER_LS_KEY = 'redux_localstorage_simple_user'

export const SESSION_RECOVERY_KEY = 'cow_react310_recovery_attempts'

/** Dedupes React Strict Mode double `componentDidCatch` in development. */
const RELOAD_SCHEDULED_KEY = 'cow_react310_reload_pending'

export const MAX_RECOVERY_ATTEMPTS = 1

/**
 * Clears StrictMode / same-tick dedupe flags on every document load.
 * sessionStorage survives `location.reload()`, so the attempt counter must reset on a
 * fresh document navigation — but not on reload — or the first post-reload render will
 * think recovery already ran and skip `reload()` entirely.
 */
export function resetReact310RecoveryOnDocumentLoad(): void {
  try {
    sessionStorage.removeItem(RELOAD_SCHEDULED_KEY)
    const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (entry?.type === 'reload') {
      return
    }
    sessionStorage.removeItem(SESSION_RECOVERY_KEY)
  } catch {
    // ignore
  }
}

export function getRecoveryAttempts(): number {
  try {
    return Number(sessionStorage.getItem(SESSION_RECOVERY_KEY) || '0')
  } catch {
    return MAX_RECOVERY_ATTEMPTS
  }
}

function incrementRecoveryAttempts(): void {
  try {
    sessionStorage.setItem(SESSION_RECOVERY_KEY, String(getRecoveryAttempts() + 1))
  } catch {
    // ignore
  }
}

export function isReactError310(error: unknown): boolean {
  const message =
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
      ? (error as Error).message
      : typeof error === 'string'
        ? error
        : ''

  if (!message) {
    return false
  }

  return (
    message.includes('Minified React error #310') ||
    message.includes('React error #310') ||
    message.includes('Rendered more hooks than during the previous render')
  )
}

/**
 * Clears persisted user slice and schedules a reload (at most MAX_RECOVERY_ATTEMPTS per
 * sessionStorage counter). Returns true if recovery was triggered.
 */
export function tryRecoverFromReactError310(error: unknown): boolean {
  if (!isReactError310(error)) {
    return false
  }
  try {
    if (sessionStorage.getItem(RELOAD_SCHEDULED_KEY) === '1') {
      return true
    }
    if (getRecoveryAttempts() >= MAX_RECOVERY_ATTEMPTS) {
      return false
    }
    incrementRecoveryAttempts()
    sessionStorage.setItem(RELOAD_SCHEDULED_KEY, '1')
  } catch {
    return false
  }

  try {
    localStorage.removeItem(REDUX_USER_LS_KEY)
  } catch {
    // ignore (private mode, etc.)
  }

  console.warn('React #310 / Rendered more hooks than during the previous render. Reloading...')

  window.setTimeout(() => {
    window.location.reload()
  }, 0)

  return true
}
