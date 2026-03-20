import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react'

/** Redux persist key for user slice (see persist config). */
const REDUX_USER_LS_KEY = 'redux_localstorage_simple_user'

const SESSION_RECOVERY_KEY = 'cow_react310_recovery_attempts'
const MAX_RECOVERY_ATTEMPTS = 1

function getRecoveryAttempts(): number {
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
  if (!(error instanceof Error)) {
    return false
  }
  const { message } = error
  return (
    message.includes('Minified React error #310') ||
    message.includes('React error #310') ||
    message.includes('Rendered more hooks than during the previous render')
  )
}

type State = {
  caughtError: Error | null
}

/**
 * Catches React #310 (hooks order mismatch), clears persisted user redux slice once per tab session, reloads.
 * Other errors are rethrown during render so the outer ErrorBoundary fallback (and Sentry via its componentDidCatch) still applies.
 */
export class React310RecoveryErrorBoundary extends Component<PropsWithChildren, State> {
  override state: State = { caughtError: null }

  static getDerivedStateFromError(error: Error): State {
    return { caughtError: error }
  }

  override componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
    if (isReactError310(error) && getRecoveryAttempts() < MAX_RECOVERY_ATTEMPTS) {
      incrementRecoveryAttempts()

      try {
        localStorage.removeItem(REDUX_USER_LS_KEY)
      } catch {
        // ignore (private mode, etc.)
      }

      window.location.reload()
    }
  }

  override render(): ReactNode {
    const { caughtError } = this.state

    if (caughtError) {
      // Always throw and let the parent ErrorBoundary handle the UI part and
      // send the error to Sentry, while this one triggers the page reload.
      throw caughtError
    }

    return this.props.children
  }
}
