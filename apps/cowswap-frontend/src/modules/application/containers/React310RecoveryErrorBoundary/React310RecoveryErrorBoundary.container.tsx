import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react'

import { getCowAnalytics } from '@cowprotocol/analytics'

import { isReactError310, tryRecoverFromReactError310 } from '../../lib/react310Recovery'

export { isReactError310 } from '../../lib/react310Recovery'

type State = {
  caughtError: Error | null
  exhausted310: boolean
}

/**
 * Catches errors and check if they are React error #310 (Rendered more hooks
 * than during the previous render), clears persisted user redux slice once per
 * tab session, and reloads the page.
 *
 * Non-#310 errors are rethrown so the outer ErrorBoundary fallback (and Sentry)
 * still apply.
 */
export class React310RecoveryErrorBoundary extends Component<PropsWithChildren, State> {
  override state: State = { caughtError: null, exhausted310: false }

  static getDerivedStateFromError(error: Error): State {
    return { caughtError: error, exhausted310: false }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (!isReactError310(error)) {
      return
    }

    if (tryRecoverFromReactError310(error)) {
      getCowAnalytics()?.sendError(error, errorInfo.toString())

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
