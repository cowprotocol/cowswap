import { ReactNode, useCallback, useState } from 'react'

import { Loader, UI, Toggle } from '@cowprotocol/ui'

import { ConnectTelegramModal } from '../../containers/ConnectTelegram/ConnectTelegramModal'
import { ConnectState } from '../../hooks/useTelegramConnect'

interface TelegramConnectionStatusProps {
  isLoading: boolean
  isSubscribed: boolean
  connectState: ConnectState
  deepLink: string | null
  connect(): Promise<void>
  cancelConnect(): void
  disconnect(): Promise<void>
}

export function TelegramConnectionStatus({
  isLoading,
  isSubscribed,
  connectState,
  deepLink,
  connect,
  cancelConnect,
  disconnect,
}: TelegramConnectionStatusProps): ReactNode {
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleToggle = useCallback(async () => {
    if (isSubscribed) {
      setIsDisconnecting(true)
      try {
        await disconnect()
      } catch (error) {
        // No dedicated disconnect-error UI - swallow and let the toggle revert to "subscribed".
        console.error('[TelegramConnectionStatus] Failed to disconnect Telegram notifications', error)
      } finally {
        setIsDisconnecting(false)
      }
    } else {
      try {
        await connect()
      } catch (error) {
        // connect() handles its own errors internally (connectState becomes 'error'),
        // this is just a safety net against an unhandled rejection.
        console.error('[TelegramConnectionStatus] Failed to start Telegram connect flow', error)
      }
    }
  }, [isSubscribed, connect, disconnect])

  if (isLoading || isDisconnecting) {
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
