import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { useTgAuthorization } from '../hooks/useTgAuthorization'
import { useTgSubscription } from '../hooks/useTgSubscription'
import { TelegramConnectionStatus } from '../pure/TelegramConnectionStatus'

import type { TelegramData } from '../utils/devTg'

const Wrapper = styled.div``

const TELEGRAM_AUTH_WIDGET_URL = 'https://telegram.org/js/telegram-widget.js?22'

type TelegramSubscriptionControls = ReturnType<typeof useTgSubscription>

export interface ConnectTelegramController {
  wrapperRef: RefObject<HTMLDivElement | null>
  isLoading: boolean
  isSubscribed: TelegramSubscriptionControls['isTgSubscribed']
  needsAuthorization: boolean
  authorize: () => Promise<TelegramData | null>
  toggleSubscription: TelegramSubscriptionControls['toggleSubscription']
  subscribeWithData: TelegramSubscriptionControls['subscribeWithData']
  username?: string
}

export function useConnectTelegram(): ConnectTelegramController {
  const { account } = useWalletInfo()
  const [isTelegramScriptLoading, setIsTelegramScriptLoading] = useState<boolean>(true)
  const telegramWrapperRef = useRef<HTMLDivElement | null>(null)

  const authorization = useTgAuthorization()
  const { isTgSubscribed, isCmsCallInProgress, toggleSubscription, subscribeWithData } = useTgSubscription(account, authorization)

  const { authorize, authenticate, tgData, isLoginInProgress, isAuthChecked } = authorization

  useEffect(() => {
    if (!telegramWrapperRef.current) return

    if (telegramWrapperRef.current.getElementsByTagName('script').length > 0) {
      setIsTelegramScriptLoading(false)
      return
    }

    const scriptElement = document.createElement('script')
    scriptElement.src = TELEGRAM_AUTH_WIDGET_URL
    scriptElement.async = true
    scriptElement.onload = () => {
      setIsTelegramScriptLoading(false)
    }

    telegramWrapperRef.current.appendChild(scriptElement)
  }, [])

  /**
   * Authenticate once on start
   */
  useEffect(() => {
    authenticate()
  }, [authenticate])

  const isLoading = isTelegramScriptLoading || !isAuthChecked || isCmsCallInProgress || isLoginInProgress
  const needsAuthorization = isAuthChecked && !tgData

  return useMemo(
    () => ({
      wrapperRef: telegramWrapperRef,
      isLoading,
      isSubscribed: isTgSubscribed,
      needsAuthorization,
      authorize,
      toggleSubscription,
      subscribeWithData,
      username: tgData?.username,
    }),
    [
      authorize,
      isLoading,
      isTgSubscribed,
      needsAuthorization,
      subscribeWithData,
      toggleSubscription,
      tgData?.username,
    ],
  )
}

interface ConnectTelegramProps {
  controller: ConnectTelegramController
}

export function ConnectTelegram({ controller }: ConnectTelegramProps): ReactElement {
  const {
    wrapperRef,
    isLoading,
    isSubscribed,
    needsAuthorization,
    authorize,
    toggleSubscription,
    subscribeWithData,
  } = controller

  return (
    <Wrapper ref={wrapperRef}>
      <TelegramConnectionStatus
        isLoading={isLoading}
        isSubscribed={isSubscribed}
        needsAuthorization={needsAuthorization}
        authorize={authorize}
        toggleSubscription={toggleSubscription}
        subscribeWithData={subscribeWithData}
      />
    </Wrapper>
  )
}
