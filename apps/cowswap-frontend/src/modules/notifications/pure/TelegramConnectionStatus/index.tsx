import { ReactNode, useCallback } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'
import { Loader, UI, Toggle } from '@cowprotocol/ui'

import { ConnectTelegramModal } from '../../containers/ConnectTelegram/ConnectTelegramModal'
import { ConnectState } from '../../hooks/useTelegramConnect'

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
    if (isSubscribed) {
      // Unsubscribing only happens from the bot side - send the user there to tap
      // "Unsubscribe" instead of toggling anything here. The toggle itself stays on
      // until the next status refresh notices they actually unsubscribed.
      if (botDeepLink) {
        window.open(botDeepLink, '_blank', 'noopener,noreferrer')
      }
    } else {
      try {
        await connect()
      } catch (err: unknown) {
        // connect() handles its own errors internally (connectState becomes 'error'),
        // this is just a safety net against an unhandled rejection.
        console.error('[TelegramConnectionStatus] Failed to start Telegram connect flow', normalizeError(err))
      }
    }
  }, [isSubscribed, botDeepLink, connect])

  if (isLoading) {
    return <Loader size="33px" stroke={`var(${UI.COLOR_TEXT_OPACITY_50})`} />
  }

  return (
    <div>
      <Toggle
        id="toggle-telegram-notifications"
        checked={isSubscribed}
        toggle={handleToggle}
        inactiveBgColor={`var(${UI.COLOR_PAPER})`}
      />
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
