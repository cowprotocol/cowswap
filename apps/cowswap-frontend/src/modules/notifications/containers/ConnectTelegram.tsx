import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { getCmsClient } from '@cowprotocol/core'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { useTgAuthorization } from '../hooks/useTgAuthorization'
import { TelegramConnectionStatus } from '../pure/TelegramConnectionStatus'

const Wrapper = styled.div`
  padding-left: 12px;
`

const Option = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
`

const TELEGRAM_AUTH_WIDGET_URL = 'https://telegram.org/js/telegram-widget.js?22'

export function ConnectTelegram(): ReactNode {
  const { account } = useWalletInfo()
  const [isTelegramScriptLoading, setIsTelegramScriptLoading] = useState<boolean>(true)
  const [isTgSubscribed, setTgSubscribed] = useState<boolean>(false)
  const [isCmsCallInProgress, setIsCmsCallInProgress] = useState<boolean>(false)
  const telegramWrapperRef = useRef<HTMLDivElement>(null)

  const { authorize, tgData, isLoginInProgress, isAuthChecked } = useTgAuthorization()

  const checkOrAddTgSubscription = useCallback(
    (method: string) => {
      if (!tgData || !account) return

      setIsCmsCallInProgress(true)

      getCmsClient()
        .POST(method, { body: { account, data: tgData } })
        .then(({ data: result }: { data: boolean }) => {
          setTgSubscribed(result)
        })
        .finally(() => {
          setIsCmsCallInProgress(false)
        })
    },
    [tgData, account],
  )

  useEffect(() => {
    if (!account || !tgData) return

    setTgSubscribed(false)

    checkOrAddTgSubscription('/add-tg-subscription')
  }, [account, tgData, checkOrAddTgSubscription])

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

  const isLoading = isTelegramScriptLoading || !isAuthChecked || isCmsCallInProgress || isLoginInProgress

  return (
    <Wrapper ref={telegramWrapperRef}>
      <Option>
        <div>Enable notifications</div>
        <TelegramConnectionStatus isLoading={isLoading} isSubscribed={isTgSubscribed} subscribeAccount={authorize} />
      </Option>
    </Wrapper>
  )
}
