import { useEffect, useRef, useState } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { cmsClient } from 'cmsClient'
import { CheckCircle } from 'react-feather'

interface TelegramData {
  auth_date: number
  first_name: string
  hash: string
  id: number
  photo_url: string
  username: string
}

export function ConnectTelegram() {
  const { account } = useWalletInfo()
  const [isTgSubscribed, setTgSubscribed] = useState<boolean>(false)
  const [tgData, setTgData] = useState<TelegramData | null>(null)
  const telegramWrapperRef = useRef<HTMLDivElement>(null)
  const isDataReceivedRef = useRef(false)

  useEffect(() => {
    if (!tgData || !account || isDataReceivedRef.current) return

    isDataReceivedRef.current = true

    cmsClient
      .POST('/add-tg-subscription', { body: { account, data: tgData } })
      .then(({ data: result }: { data: boolean }) => {
        setTgSubscribed(result)
      })
  }, [tgData, account])

  useEffect(() => {
    ;(window as any)['onTelegramAuth'] = setTgData

    const scriptElement = document.createElement('script')
    scriptElement.src = 'https://telegram.org/js/telegram-widget.js?22'
    scriptElement.setAttribute('data-telegram-login', 'cowNotificationsBot')
    scriptElement.setAttribute('data-size', 'medium')
    scriptElement.setAttribute('data-onauth', 'onTelegramAuth(user)')
    scriptElement.setAttribute('data-request-access', 'write')
    scriptElement.async = true

    telegramWrapperRef.current!.appendChild(scriptElement)
  }, [])

  useEffect(() => {
    if (!isTgSubscribed) return

    const prevIframe = document.getElementById('telegram-login-cowNotificationsBot')

    if (prevIframe) {
      prevIframe.parentNode!.removeChild(prevIframe)
    }
  }, [isTgSubscribed])

  if (isTgSubscribed) {
    return (
      <div>
        Connected <CheckCircle size={15} />
      </div>
    )
  }

  return <div ref={telegramWrapperRef}></div>
}
