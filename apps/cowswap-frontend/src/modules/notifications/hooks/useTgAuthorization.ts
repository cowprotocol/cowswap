import { useCallback, useEffect, useRef, useState } from 'react'

import { getTelegramAuth } from '../services/getTelegramAuth'

const TG_BOT_ID = 7076584722 // cowNotificationsBot

const AUTH_OPTIONS = {
  bot_id: TG_BOT_ID,
  lang: 'en',
  request_access: 'write',
}

interface TelegramData {
  auth_date: number
  first_name: string
  hash: string
  id: number
  photo_url: string
  username: string
}

export interface TgAuthorization {
  tgData: TelegramData | null
  authorize(): void
  isAuthChecked: boolean
  isLoginInProgress: boolean
}

export function useTgAuthorization(): TgAuthorization {
  const [tgData, setTgData] = useState<TelegramData | null>(null)
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false)
  const [isLoginInProgress, setIsLoginInProgress] = useState<boolean>(false)

  const isAuthRequestedRef = useRef(false)

  const authenticate = useCallback((callback?: () => void): void => {
    getTelegramAuth(TG_BOT_ID, (response) => {
      if (response && response.user) {
        setTgData(response.user)
      }
      setIsAuthChecked(true)
      callback?.()
    })
  }, [])

  const authorize = useCallback((): void => {
    if (!window.Telegram) return

    setIsLoginInProgress(true)

    window.Telegram.Login.auth(AUTH_OPTIONS, (data) => {
      if (data) {
        setTgData(data)
        setIsLoginInProgress(false)
      } else {
        authenticate(() => {
          setIsLoginInProgress(false)
        })
      }
    })
  }, [authenticate])

  /**
   * Check if the user is already authenticated
   */
  useEffect(() => {
    if (isAuthRequestedRef.current) return

    isAuthRequestedRef.current = true

    authenticate()
  }, [authenticate])

  return { authorize, tgData, isAuthChecked, isLoginInProgress }
}
