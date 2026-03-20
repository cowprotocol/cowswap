import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react'

import { isReactError310, tryRecoverFromReactError310 } from '../../lib/react310Recovery'

export { isReactError310 } from '../../lib/react310Recovery'

type State = {
  caughtError: Error | null
  exhausted310: boolean
}

/**
 * Catches React #310 (hooks order mismatch), clears persisted user redux slice once per tab session, reloads.
 *
 * For #310 we render `null` after `getDerivedStateFromError` instead of rethrowing during render.
 * Rethrowing immediately prevented `componentDidCatch` from running in practice, so `reload()` never fired.
 *
 * Non-#310 errors are rethrown so the outer ErrorBoundary fallback (and Sentry) still apply.
 */
export class React310RecoveryErrorBoundary extends Component<PropsWithChildren, State> {
  override state: State = { caughtError: null, exhausted310: false }

  static getDerivedStateFromError(error: Error): State {
    return { caughtError: error, exhausted310: false }
  }

  override componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
    if (!isReactError310(error)) {
      return
    }
    if (tryRecoverFromReactError310(error)) {
      return
    }
    this.setState({ exhausted310: true })
  }

  override render(): ReactNode {
    const { caughtError, exhausted310 } = this.state

    if (!caughtError) {
      return this.props.children
    }

    if (isReactError310(caughtError) && !exhausted310) {
      return null
    }

    throw caughtError
  }
}
