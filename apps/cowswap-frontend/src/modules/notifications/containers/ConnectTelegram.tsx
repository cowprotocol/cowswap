import { useEffect, useRef, useState } from 'react'

import { getCmsClient } from '@cowprotocol/core'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { TelegramConnectionStatus } from '../pure/TelegramConnectionStatus'
import { getTelegramAuth } from '../services/getTelegramAuth'

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

interface TelegramData {
  auth_date: number
  first_name: string
  hash: string
  id: number
  photo_url: string
  username: string
}

const TELEGRAM_AUTH_WIDGET_URL = 'https://telegram.org/js/telegram-widget.js?22'
const TG_BOT_ID = 7076584722 // cowNotificationsBot

const AUTH_OPTIONS = {
  bot_id: TG_BOT_ID,
  lang: 'en',
  request_access: 'write',
}

export function ConnectTelegram() {
  const { account } = useWalletInfo()
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false)
  const [isTelegramScriptLoading, setIsTelegramScriptLoading] = useState<boolean>(true)
  const [isTgSubscribed, setTgSubscribed] = useState<boolean>(false)
  const [isCmsCallInProgress, setIsCmsCallInProgress] = useState<boolean>(false)
  const [isLoginInProgress, setIsLoginInProgress] = useState<boolean>(false)

  const [tgData, setTgData] = useState<TelegramData | null>(null)
  const telegramWrapperRef = useRef<HTMLDivElement>(null)
  const isDataReceivedRef = useRef(false)
  const isAuthRequestedRef = useRef(false)

  const authorize = (callback?: () => void) => {
    getTelegramAuth(TG_BOT_ID, (response) => {
      if (response && response.user) {
        setIsCmsCallInProgress(true)
        setTgData(response.user)
      }
      setIsAuthChecked(true)
      callback?.()
    })
  }

  const authenticate = () => {
    if (!window.Telegram) return

    setIsLoginInProgress(true)

    window.Telegram.Login.auth(AUTH_OPTIONS, (data) => {
      if (data) {
        setTgData(data)
        setIsLoginInProgress(false)
      } else {
        authorize(() => {
          setIsLoginInProgress(false)
        })
      }
    })
  }

  /**
   * Check if the user is already authenticated
   */
  useEffect(() => {
    if (isAuthRequestedRef.current) return

    isAuthRequestedRef.current = true

    authorize()
  }, [])

  useEffect(() => {
    if (!tgData || !account || isDataReceivedRef.current) return

    isDataReceivedRef.current = true

    setIsCmsCallInProgress(true)

    getCmsClient()
      .POST('/add-tg-subscription', { body: { account, data: tgData } })
      .then(({ data: result }: { data: boolean }) => {
        setTgSubscribed(result)
      })
      .finally(() => {
        setIsCmsCallInProgress(false)
      })
  }, [tgData, account])

  useEffect(() => {
    if (!telegramWrapperRef.current) return

    if (telegramWrapperRef.current.getElementsByTagName('script').length > 0) return

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
        <TelegramConnectionStatus isLoading={isLoading} isSubscribed={isTgSubscribed} authenticate={authenticate} />
      </Option>
    </Wrapper>
  )
}
