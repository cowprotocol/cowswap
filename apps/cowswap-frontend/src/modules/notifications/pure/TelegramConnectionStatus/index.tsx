import { ReactNode, useCallback } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { Loader, UI, Toggle } from '@cowprotocol/ui'

import { ConnectTelegramModal } from '../../containers/ConnectTelegram/ConnectTelegramModal'
import { ConnectState } from '../../hooks/useTelegramConnect'

// The unsubscribed toggle click is a no-op: unsubscribing happens on the bot side,
// this state renders as a plain link instead (see the `root="a"` Toggle below).
const NOOP: Command = () => undefined

interface TelegramConnectionStatusProps {
  isLoading: boolean
  isSubscribed: boolean
  // Unsubscribing only happens from the bot side (tap its "Unsubscribe" button) - this
  // is a static link to open that chat, not a fresh single-use connect-token.
  botDeepLink: string | undefined
  connectState: ConnectState
  deepLink: string | null
  connect(): Promise<void>
  cancelConnect(): void
}

export function TelegramConnectionStatus({
  isLoading,
  isSubscribed,
  botDeepLink,
  connectState,
  deepLink,
  connect,
  cancelConnect,
}: TelegramConnectionStatusProps): ReactNode {
  const handleToggle = useCallback(async () => {
    // Unsubscribing only happens from the bot side (rendered as a plain link below),
    // so this only ever handles the subscribe flow.
    try {
      await connect()
    } catch (err: unknown) {
      // connect() handles its own errors internally (connectState becomes 'error'),
      // this is just a safety net against an unhandled rejection.
      console.error('[TelegramConnectionStatus] Failed to start Telegram connect flow', normalizeError(err))
    }
  }, [connect])

  if (isLoading) {
    return <Loader size="33px" stroke={`var(${UI.COLOR_TEXT_OPACITY_50})`} />
  }

  return (
    <div>
      {isSubscribed ? (
        // window.open() doesn't work inside an iframe - use a real <a> so the browser
        // handles the navigation natively instead. Falls back to a non-navigating
        // span (still a no-op toggle) if botDeepLink hasn't loaded yet.
        <Toggle
          root={botDeepLink ? 'a' : 'span'}
          id="toggle-telegram-notifications"
          checked={isSubscribed}
          toggle={NOOP}
          inactiveBgColor={`var(${UI.COLOR_PAPER})`}
          href={botDeepLink}
          target={botDeepLink ? '_blank' : undefined}
          rel={botDeepLink ? 'noopener noreferrer' : undefined}
          aria-label="Unsubscribe from Telegram notifications (opens Telegram)"
        />
      ) : (
        <Toggle
          id="toggle-telegram-notifications"
          checked={isSubscribed}
          toggle={handleToggle}
          inactiveBgColor={`var(${UI.COLOR_PAPER})`}
        />
      )}
      <ConnectTelegramModal
        isOpen={connectState !== 'idle'}
        connectState={connectState}
        deepLink={deepLink}
        onRetry={connect}
        onDismiss={cancelConnect}
      />
    </div>
  )
}
