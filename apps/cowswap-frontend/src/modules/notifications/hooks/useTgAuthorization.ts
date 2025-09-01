import { useCallback, useEffect, useRef, useState } from 'react'

import ms from 'ms.macro'

import { getTelegramAuth } from '../services/getTelegramAuth'

const TG_SESSION_CHECK_INTERVAL = ms`3s`

const ENV_TG_BOT_ID = process.env.REACT_APP_TG_BOT_ID
const TG_BOT_ID = ENV_TG_BOT_ID ? parseInt(ENV_TG_BOT_ID) : 7076584722 // cowNotificationsBot

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

  const authenticate = useCallback((callback?: (tgData: TelegramData | null) => void): void => {
    getTelegramAuth(TG_BOT_ID, (response) => {
      const tgData = (response && response.user) || null

      setTgData(tgData)
      setIsAuthChecked(true)
      callback?.(tgData)
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

    let intervalId: number | null = null

    authenticate((tgData) => {
      if (!tgData) return

      // When is connected to Telegram, do a periodical check if the connection still exists
      // Because the session might be terminated from Telegram side
      intervalId = setInterval(authenticate, TG_SESSION_CHECK_INTERVAL) as unknown as number
    })

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [authenticate])

  return { authorize, tgData, isAuthChecked, isLoginInProgress }
}
