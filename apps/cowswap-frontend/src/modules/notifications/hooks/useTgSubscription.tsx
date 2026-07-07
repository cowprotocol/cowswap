import { useAtom } from 'jotai'
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getCmsClient } from '@cowprotocol/core'
import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'
import { useAddSnackbar } from '@cowprotocol/snackbars'

import { TgAuthorization } from './useTgAuthorization'

import { tgSubscriptionAtom } from '../atoms/tgSubscriptionAtom'
import { SubscriptionSuccessContent } from '../pure/SubscriptionSuccessContent.pure'
import { TelegramData } from '../types'

const EMPTY_SUBSCRIPTION_RESPONSE = Promise.resolve({ data: false as const })

type SubscriptionApiCaller = (
  method: string,
  targetAccount: string,
  data: TelegramData,
) => Promise<{ data: boolean }> | undefined

interface SubscriptionCheckEffectsParams {
  account: string | undefined
  callSubscriptionApi: SubscriptionApiCaller
  setTgSubscribed: (targetAccount: string, value: boolean) => void
  skipNextCheckRef: MutableRefObject<boolean>
  tgData: TelegramData | null
}

interface SubscriptionCheckParams {
  callSubscriptionApi: SubscriptionApiCaller
  account: string
  errorMessage: string
  tgData: TelegramData
  onSuccess: (isSubscribed: boolean) => void
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
  const [subscriptionByAccount, setSubscriptionByAccount] = useAtom(tgSubscriptionAtom)
  const addSnackbar = useAddSnackbar()
  const skipNextCheckRef = useRef(false)
  const accountKey = account ? getAddressKey(account) : undefined
  const isTgSubscribed = accountKey ? Boolean(subscriptionByAccount[accountKey]) : false

  const setTgSubscribed = useCallback(
    (targetAccount: string, value: boolean) => {
      const targetAccountKey = getAddressKey(targetAccount)

      setSubscriptionByAccount((state) => {
        if (!value) {
          const { [targetAccountKey]: _, ...nextState } = state
          return nextState
        }

        return {
          ...state,
          [targetAccountKey]: true,
        }
      })
    },
    [setSubscriptionByAccount],
  )

  const callSubscriptionApi = useSubscriptionApiCaller(account, setIsCmsCallInProgress)

  useSubscriptionCheckEffects({
    account,
    callSubscriptionApi,
    setTgSubscribed,
    skipNextCheckRef,
    tgData: tgData,
  })

  const addTgSubscription = useCallback(
    async (data: TelegramData): Promise<boolean> => {
      if (!account) {
        return false
      }

      const { data: result } = await (callSubscriptionApi('/add-tg-subscription', account, data) ??
        EMPTY_SUBSCRIPTION_RESPONSE)
      setTgSubscribed(account, result)
      if (result) {
        addSnackbar({
          id: `telegram-enabled-${Date.now()}`,
          icon: 'success',
          content: <SubscriptionSuccessContent username={data.username || 'Unknown'} />,
        })
      }

      return result
    },
    [account, callSubscriptionApi, addSnackbar, setTgSubscribed],
  )

  const removeSubscription = useCallback(
    async (data: TelegramData): Promise<boolean> => {
      if (!account) {
        return false
      }

      const { data: result } = await (callSubscriptionApi('/remove-tg-subscription', account, data) ??
        EMPTY_SUBSCRIPTION_RESPONSE)
      if (!result) {
        return false
      }

      setTgSubscribed(account, false)
      clearAuth()
      return true
    },
    [account, callSubscriptionApi, clearAuth, setTgSubscribed],
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

  return useMemo(
    () => ({ isTgSubscribed, isCmsCallInProgress, toggleSubscription, subscribeWithData }),
    [isTgSubscribed, isCmsCallInProgress, toggleSubscription, subscribeWithData],
  )
}

function checkSubscriptionStatus({
  account,
  callSubscriptionApi,
  errorMessage,
  tgData,
  onSuccess,
}: SubscriptionCheckParams): void {
  const subscriptionPromise = callSubscriptionApi('/check-tg-subscription', account, tgData)
  if (!subscriptionPromise) return

  subscriptionPromise
    .then(({ data: result }: { data: boolean }) => {
      onSuccess(result)
    })
    .catch((error: unknown) => {
      console.error(errorMessage, error)
    })
}

function useSubscriptionApiCaller(
  account: string | undefined,
  setIsCmsCallInProgress: (state: boolean) => void,
): SubscriptionApiCaller {
  return useCallback(
    (method: string, targetAccount: string, data: TelegramData) => {
      if (!account || !areAddressesEqual(account, targetAccount)) return
      setIsCmsCallInProgress(true)
      return getCmsClient()
        .POST(method, { body: { account: targetAccount, data } })
        .finally(() => setIsCmsCallInProgress(false))
    },
    [account, setIsCmsCallInProgress],
  )
}

function useSubscriptionCheckEffects({
  account,
  callSubscriptionApi,
  setTgSubscribed,
  skipNextCheckRef,
  tgData,
}: SubscriptionCheckEffectsParams): void {
  const tgDataRef = useRef(tgData)

  useEffect(() => {
    tgDataRef.current = tgData
  }, [tgData])

  useEffect(() => {
    if (!account || !tgDataRef.current || skipNextCheckRef.current) return

    checkSubscriptionStatus({
      account,
      callSubscriptionApi,
      errorMessage: 'Failed to check Telegram subscription',
      tgData: tgDataRef.current,
      onSuccess: (isSubscribed) => setTgSubscribed(account, isSubscribed),
    })
  }, [account, tgData?.username, callSubscriptionApi, setTgSubscribed, skipNextCheckRef])
}
