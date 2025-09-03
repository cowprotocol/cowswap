import { ReactNode, useEffect, useRef, useState } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { useTgAuthorization } from '../hooks/useTgAuthorization'
import { useTgSubscription } from '../hooks/useTgSubscription'
import { TelegramConnectionStatus } from '../pure/TelegramConnectionStatus'

const Wrapper = styled.div``

const TELEGRAM_AUTH_WIDGET_URL = 'https://telegram.org/js/telegram-widget.js?22'

export function ConnectTelegram(): ReactNode {
  const { account } = useWalletInfo()
  const [isTelegramScriptLoading, setIsTelegramScriptLoading] = useState<boolean>(true)
  const telegramWrapperRef = useRef<HTMLDivElement>(null)

  const authorization = useTgAuthorization()
  const { isTgSubscribed, isCmsCallInProgress, toggleSubscription } = useTgSubscription(account, authorization)

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

  return (
    <Wrapper ref={telegramWrapperRef}>
      <TelegramConnectionStatus
        isLoading={isLoading}
        isSubscribed={isTgSubscribed}
        needsAuthorization={needsAuthorization}
        authorize={authorize}
        toggleSubscription={toggleSubscription}
      />
    </Wrapper>
  )
}
