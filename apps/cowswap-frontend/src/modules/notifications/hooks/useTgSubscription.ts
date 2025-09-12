import { useAtom } from 'jotai'
import { createElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getCmsClient } from '@cowprotocol/core'
import { useAddSnackbar } from '@cowprotocol/snackbars'

import { TgAuthorization } from './useTgAuthorization'

import { tgSubscriptionAtom } from '../atoms/tgSubscriptionAtom'
import { TG_DEV_BYPASS, type TelegramData, simulateDevModeApiCall, setDevSubscriptionState } from '../utils/devTg'


const createSubscriptionSuccessContent = (username: string): ReactNode => {
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
  const [isTgSubscribed, setTgSubscribed] = useAtom(tgSubscriptionAtom)
  const addSnackbar = useAddSnackbar()
  const skipNextCheckRef = useRef(false)

  // Reset subscription state when account changes (wallet disconnects/switches)
  useEffect(() => {
    if (!account) {
      setTgSubscribed(false)
    }
  }, [account, setTgSubscribed])

  const callSubscriptionApi: SubscriptionApiCaller = useCallback(
    (method: string, data: TelegramData) => {
      if (!account) return
      if (TG_DEV_BYPASS) return simulateDevModeApiCall(method, setIsCmsCallInProgress, account)
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
    [callSubscriptionApi, addSnackbar, setTgSubscribed],
  )

  const removeSubscription = useCallback(
    (data: TelegramData) => {
      callSubscriptionApi('/remove-tg-subscription', data)?.then(({ data: result }: { data: boolean }) => {
        if (!result) return
        setTgSubscribed(false)
        clearAuth()
        if (TG_DEV_BYPASS && account) setDevSubscriptionState(account, false)
      })
    },
    [callSubscriptionApi, clearAuth, setTgSubscribed, account],
  )

  const subscribeWithData = useCallback(
    async (data: TelegramData) => {
      skipNextCheckRef.current = true
      isTgSubscribed ? removeSubscription(data) : addTgSubscription(data)
    },
    [isTgSubscribed, addTgSubscription, removeSubscription],
  )

  const toggleSubscription = useCallback(async () => {
    const data = tgData || (await authorize())
    if (!data) return
    await subscribeWithData(data)
  }, [tgData, authorize, subscribeWithData])

  /**
   * Check the subscription when Telegram is authorized
   */
  useEffect(() => {
    if (!tgData || skipNextCheckRef.current) {
      skipNextCheckRef.current = false
      return
    }
    callSubscriptionApi('/check-tg-subscription', tgData)?.then(({ data: result }: { data: boolean }) => {
      setTgSubscribed(result)
    })
  }, [tgData, callSubscriptionApi, setTgSubscribed])

  /**
   * Re-check subscription when account changes (if authorized already)
   */
  useEffect(() => {
    if (!account || !tgData || skipNextCheckRef.current) return
    callSubscriptionApi('/check-tg-subscription', tgData)?.then(({ data: result }: { data: boolean }) => {
      setTgSubscribed(result)
    })
  }, [account, tgData, callSubscriptionApi, setTgSubscribed])

  return useMemo(
    () => ({ isTgSubscribed, isCmsCallInProgress, toggleSubscription, subscribeWithData }),
    [isTgSubscribed, isCmsCallInProgress, toggleSubscription, subscribeWithData],
  )
}
