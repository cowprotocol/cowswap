import React, { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getCmsClient } from '@cowprotocol/core'
import { useAddSnackbar } from '@cowprotocol/snackbars'

import { TgAuthorization } from './useTgAuthorization'

const TG_DEV_BYPASS = process.env.NODE_ENV === 'development' && process.env.REACT_APP_TG_DEV_BYPASS === 'true'

// In dev mode, store subscription state in sessionStorage to persist across calls
const DEV_SUBSCRIPTION_KEY = 'tg_dev_subscription_state'
const getDevSubscriptionState = (): boolean => {
  if (!TG_DEV_BYPASS) return false
  return sessionStorage.getItem(DEV_SUBSCRIPTION_KEY) === 'true'
}
const setDevSubscriptionState = (subscribed: boolean): void => {
  if (!TG_DEV_BYPASS) return
  sessionStorage.setItem(DEV_SUBSCRIPTION_KEY, String(subscribed))
}

const simulateDevModeApiCall = (method: string, setIsCmsCallInProgress: (loading: boolean) => void): Promise<{ data: boolean }> => {
  setIsCmsCallInProgress(true)
  return new Promise((resolve) => {
    setTimeout(() => {
      setIsCmsCallInProgress(false)
      
      if (method.includes('check')) {
        // Return current subscription state
        const currentState = getDevSubscriptionState()
        resolve({ data: currentState })
      } else if (method.includes('add')) {
        // Set subscription to true
        setDevSubscriptionState(true)
        resolve({ data: true })
      } else if (method.includes('remove')) {
        // Set subscription to false
        setDevSubscriptionState(false)
        resolve({ data: true }) // API call succeeds
      } else {
        resolve({ data: true })
      }
    }, 300) // Small delay for realism
  })
}

const createSubscriptionSuccessContent = (username: string): React.ReactElement => {
  return createElement('div', {}, [
    createElement('strong', { key: 'title' }, 'Trade alerts enabled successfully'),
    createElement('br', { key: 'br' }),
    `Telegram trade alerts enabled for user @${username}`,
  ])
}

type SubscriptionApiCaller = (method: string, data: TelegramData) => Promise<{ data: boolean }> | undefined

interface TgSubscriptionContext {
  isTgSubscribed: boolean
  isCmsCallInProgress: boolean
  toggleSubscription(): Promise<void>
  subscribeWithData(data: TelegramData): Promise<void>
}

export function useTgSubscription(account: string | undefined, authorization: TgAuthorization): TgSubscriptionContext {
  const { tgData, authorize, clearAuth } = authorization
  const [isCmsCallInProgress, setIsCmsCallInProgress] = useState<boolean>(false)
  const [isTgSubscribed, setTgSubscribed] = useState<boolean>(false)
  const addSnackbar = useAddSnackbar()
  const isSubscriptionCheckedRef = useRef(false)
  const skipNextCheckRef = useRef(false)
  const callSubscriptionApi: SubscriptionApiCaller = useCallback(
    (method: string, data: TelegramData) => {
      if (!account) return
      if (TG_DEV_BYPASS) return simulateDevModeApiCall(method, setIsCmsCallInProgress)
      setIsCmsCallInProgress(true)
      return getCmsClient()
        .POST(method, { body: { account, data } })
        .finally(() => setIsCmsCallInProgress(false))
    },
    [account],
  )

  const addTgSubscription = useCallback(
    (data: TelegramData) => {
      callSubscriptionApi('/add-tg-subscription', data)?.then(({ data: result }: { data: boolean }) => {
        setTgSubscribed(result)
        if (result) {
          addSnackbar({
            id: `telegram-enabled-${Date.now()}`,
            icon: 'success',
            content: createSubscriptionSuccessContent(data.username || 'Unknown'),
          })
        }
      })
    },
    [callSubscriptionApi, addSnackbar],
  )

  const removeSubscription = useCallback(
    (data: TelegramData) => {
      callSubscriptionApi('/remove-tg-subscription', data)?.then(({ data: result }: { data: boolean }) => {
        if (!result) return
        setTgSubscribed(false)
        clearAuth()
        isSubscriptionCheckedRef.current = false
        if (TG_DEV_BYPASS) setDevSubscriptionState(false)
      })
    },
    [callSubscriptionApi, clearAuth],
  )

  const subscribeWithData = useCallback(async (data: TelegramData) => {
    skipNextCheckRef.current = true
    isTgSubscribed ? removeSubscription(data) : addTgSubscription(data)
  }, [isTgSubscribed, addTgSubscription, removeSubscription])

  const toggleSubscription = useCallback(async () => {
    const data = tgData || (await authorize())
    if (!data) return
    await subscribeWithData(data)
  }, [tgData, authorize, subscribeWithData])

  /**
   * Check the subscription once Telegram is authorized
   */
  useEffect(() => {
    if (!tgData || isSubscriptionCheckedRef.current || skipNextCheckRef.current) {
      skipNextCheckRef.current = false
      return
    }
    isSubscriptionCheckedRef.current = true
    callSubscriptionApi('/check-tg-subscription', tgData)?.then(({ data: result }: { data: boolean }) => {
      setTgSubscribed(result)
    })
  }, [tgData, callSubscriptionApi])

  return useMemo(
    () => ({ isTgSubscribed, isCmsCallInProgress, toggleSubscription, subscribeWithData }),
    [isTgSubscribed, isCmsCallInProgress, toggleSubscription, subscribeWithData],
  )
}
