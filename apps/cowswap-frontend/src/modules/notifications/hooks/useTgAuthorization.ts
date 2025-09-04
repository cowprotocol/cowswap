import { useCallback, useEffect, useState } from 'react'

import ms from 'ms.macro'

import { getTelegramAuth } from '../services/getTelegramAuth'

const TG_SESSION_CHECK_INTERVAL = ms`3s`

const ENV_TG_BOT_ID = process.env.REACT_APP_TG_BOT_ID
const TG_BOT_ID = ENV_TG_BOT_ID ? parseInt(ENV_TG_BOT_ID) : 7076584722 // cowNotificationsBot
const TG_DEV_BYPASS = process.env.NODE_ENV === 'development' && process.env.REACT_APP_TG_DEV_BYPASS === 'true'

// In dev mode, store auth state in sessionStorage
const DEV_AUTH_KEY = 'tg_dev_auth_state'
const clearDevAuthState = (): void => {
  if (!TG_DEV_BYPASS) return
  sessionStorage.removeItem(DEV_AUTH_KEY)
}
const hasDevAuthState = (): boolean => {
  if (!TG_DEV_BYPASS) return false
  return sessionStorage.getItem(DEV_AUTH_KEY) === 'true'
}
const setDevAuthState = (): void => {
  if (!TG_DEV_BYPASS) return
  sessionStorage.setItem(DEV_AUTH_KEY, 'true')
}

const AUTH_OPTIONS = {
  bot_id: TG_BOT_ID,
  lang: 'en',
  request_access: 'write',
}

const MOCK_TELEGRAM_DATA: TelegramData = {
  auth_date: Math.floor(Date.now() / 1000),
  first_name: 'Dev',
  hash: 'mock-hash-dev-mode',
  id: 12345,
  photo_url: '',
  username: 'devuser',
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
    if (TG_DEV_BYPASS) {
      // In dev bypass mode, check if we have auth state
      if (hasDevAuthState()) {
        setTgData(MOCK_TELEGRAM_DATA)
        setIsAuthChecked(true)
        return Promise.resolve(MOCK_TELEGRAM_DATA)
      } else {
        setTgData(null)
        setIsAuthChecked(true)
        return Promise.resolve(null)
      }
    }

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
    if (TG_DEV_BYPASS) {
      // In dev bypass mode, simulate authorization flow
      setIsLoginInProgress(true)
      await new Promise(resolve => setTimeout(resolve, 200)) // Small delay for UX
      setTgData(MOCK_TELEGRAM_DATA)
      setDevAuthState() // Store auth state
      setIsLoginInProgress(false)
      return MOCK_TELEGRAM_DATA
    }

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
    if (TG_DEV_BYPASS) {
      clearDevAuthState()
    }
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
