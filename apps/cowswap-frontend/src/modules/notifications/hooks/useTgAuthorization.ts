import { useCallback, useEffect, useState } from 'react'

import ms from 'ms.macro'

import { getTelegramAuth } from '../services/getTelegramAuth'
import { TelegramData } from '../types'

const TG_SESSION_CHECK_INTERVAL = ms`3s`

const ENV_TG_BOT_ID = process.env.REACT_APP_TG_BOT_ID
const TG_BOT_ID = ENV_TG_BOT_ID ? parseInt(ENV_TG_BOT_ID) : 7076584722 // cowNotificationsBot

const AUTH_OPTIONS = {
  bot_id: TG_BOT_ID,
  lang: 'en',
  request_access: 'write',
}

export interface TgAuthorization {
  tgData: TelegramData | null
  authorize(): Promise<TelegramData | null>
  authenticate(): Promise<TelegramData | null>
  clearAuth(): void
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

  const authorize = useCallback(async (): Promise<TelegramData | null> => {
    if (!window.Telegram) return null

    setIsLoginInProgress(true)

    return new Promise((resolve) => {
      window.Telegram?.Login.auth(AUTH_OPTIONS, (data) => {
        if (data) {
          setTgData(data)
          setIsLoginInProgress(false)
          resolve(data)
        } else {
          authenticate().then((tgData) => {
            setTgData(tgData)
            setIsLoginInProgress(false)
            resolve(tgData)
          })
        }
      })
    })
  }, [authenticate])

  const clearAuth = useCallback((): void => {
    setTgData(null)
    setIsAuthChecked(true) // Keep checked state to avoid re-checking
  }, [])

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

  return { authorize, authenticate, clearAuth, tgData, isAuthChecked, isLoginInProgress }
}
