import { useCallback, useEffect, useState } from 'react'

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
  authorize(): Promise<void>
  authenticate(): Promise<TelegramData | null>
  isAuthChecked: boolean
  isLoginInProgress: boolean
}

export function useTgAuthorization(): TgAuthorization {
  const [tgData, setTgData] = useState<TelegramData | null>(null)
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false)
  const [isLoginInProgress, setIsLoginInProgress] = useState<boolean>(false)

  const authenticate = useCallback((): Promise<TelegramData | null> => {
    return new Promise((resolve) => {
      getTelegramAuth(TG_BOT_ID, (response) => {
        const tgData = (response && response.user) || null

        setTgData(tgData)
        setIsAuthChecked(true)
        resolve?.(tgData)
      })
    })
  }, [])

  const authorize = useCallback(async (): Promise<void> => {
    if (!window.Telegram) return Promise.resolve()

    setIsLoginInProgress(true)

    return new Promise((resolve) => {
      window.Telegram?.Login.auth(AUTH_OPTIONS, (data) => {
        if (data) {
          setTgData(data)
          setIsLoginInProgress(false)
          resolve()
        } else {
          authenticate().then((tgData) => {
            setTgData(tgData)
            setIsLoginInProgress(false)
            resolve()
          })
        }
      })
    })
  }, [authenticate])

  /**
   * Initial authentication check on mount
   */
  useEffect(() => {
    authenticate()
  }, [authenticate])

  /**
   * Periodically check if the user is already authenticated
   */
  useEffect(() => {
    if (!tgData) return

    const intervalId = setInterval(authenticate, TG_SESSION_CHECK_INTERVAL)

    return () => {
      clearInterval(intervalId)
    }
  }, [tgData, authenticate])

  return { authorize, authenticate, tgData, isAuthChecked, isLoginInProgress }
}
