import { useAtom } from 'jotai'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getCmsClient } from '@cowprotocol/core'
import { useAddSnackbar } from '@cowprotocol/snackbars'

import { TgAuthorization } from './useTgAuthorization'

import { tgSubscriptionAtom } from '../atoms/tgSubscriptionAtom'
import { TG_DEV_BYPASS, type TelegramData, simulateDevModeApiCall, setDevSubscriptionState } from '../utils/devTg'

const EMPTY_SUBSCRIPTION_RESPONSE = Promise.resolve({ data: false as const })

function useResetSubscriptionOnAccountChange(account: string | undefined, setTgSubscribed: (value: boolean) => void): void {
  useEffect(() => {
    if (!account) {
      setTgSubscribed(false)
    }
  }, [account, setTgSubscribed])
}

const createSubscriptionSuccessContent = (username: string): ReactNode => (
  <div>
    <strong>Trade alerts enabled successfully</strong>
    <br />
    {`Telegram trade alerts enabled for user @${username}`}
  </div>
)

type SubscriptionApiCaller = (method: string, data: TelegramData) => Promise<{ data: boolean }> | undefined

function useSubscriptionApiCaller(
  account: string | undefined,
  setIsCmsCallInProgress: (state: boolean) => void,
): SubscriptionApiCaller {
  return useCallback(
    (method: string, data: TelegramData) => {
      if (!account) return
      if (TG_DEV_BYPASS) return simulateDevModeApiCall(method, setIsCmsCallInProgress, account)
      setIsCmsCallInProgress(true)
      return getCmsClient()
        .POST(method, { body: { account, data } })
        .finally(() => setIsCmsCallInProgress(false))
    },
    [account, setIsCmsCallInProgress],
  )
}

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
  useResetSubscriptionOnAccountChange(account, setTgSubscribed)
  const callSubscriptionApi = useSubscriptionApiCaller(account, setIsCmsCallInProgress)

  const addTgSubscription = useCallback(
    async (data: TelegramData): Promise<boolean> => {
      const { data: result } = await (callSubscriptionApi('/add-tg-subscription', data) ?? EMPTY_SUBSCRIPTION_RESPONSE)
      setTgSubscribed(result)
      if (result) {
        addSnackbar({
          id: `telegram-enabled-${Date.now()}`,
          icon: 'success',
          content: createSubscriptionSuccessContent(data.username || 'Unknown'),
        })
      }

      return result
    },
    [callSubscriptionApi, addSnackbar, setTgSubscribed],
  )

  const removeSubscription = useCallback(
    async (data: TelegramData): Promise<boolean> => {
      const { data: result } = await (callSubscriptionApi('/remove-tg-subscription', data) ?? EMPTY_SUBSCRIPTION_RESPONSE)
      if (!result) {
        return false
      }

      setTgSubscribed(false)
      clearAuth()
      if (TG_DEV_BYPASS && account) setDevSubscriptionState(account, false)

      return true
    },
    [callSubscriptionApi, clearAuth, setTgSubscribed, account],
  )

  const subscribeWithData = useCallback(
    async (data: TelegramData) => {
      skipNextCheckRef.current = true
      try {
        if (isTgSubscribed) {
          await removeSubscription(data)
        } else {
          await addTgSubscription(data)
        }
      } finally {
        skipNextCheckRef.current = false
      }
    },
    [isTgSubscribed, addTgSubscription, removeSubscription],
  )

  const toggleSubscription = useCallback(async () => {
    const data = tgData || (await authorize())
    if (!data) return
    await subscribeWithData(data)
  }, [tgData, authorize, subscribeWithData])

  // Check the subscription when Telegram is authorized
  useEffect(() => {
    if (!tgData || skipNextCheckRef.current) {
      skipNextCheckRef.current = false
      return
    }
    callSubscriptionApi('/check-tg-subscription', tgData)?.then(({ data: result }: { data: boolean }) => {
      setTgSubscribed(result)
    })
  }, [tgData, callSubscriptionApi, setTgSubscribed])

  // Re-check subscription when account changes (if authorized already)
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
