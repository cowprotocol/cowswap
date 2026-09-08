import type { ReactElement } from 'react'

import { ConnectTelegramController } from './ConnectTelegram/useConnectTelegram'

import { TelegramConnectionStatus } from '../pure/TelegramConnectionStatus'

interface ConnectTelegramProps {
  controller: ConnectTelegramController
}

export function ConnectTelegram({ controller }: ConnectTelegramProps): ReactElement {
  const { isLoading, isSubscribed, botDeepLink, connectState, deepLink, connect, cancelConnect } = controller

  return (
    <TelegramConnectionStatus
      isLoading={isLoading}
      isSubscribed={isSubscribed}
      botDeepLink={botDeepLink}
      connectState={connectState}
      deepLink={deepLink}
      connect={connect}
      cancelConnect={cancelConnect}
    />
  )
}
