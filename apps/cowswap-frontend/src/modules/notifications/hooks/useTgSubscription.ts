import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getCmsClient } from '@cowprotocol/core'

import { TgAuthorization } from './useTgAuthorization'

type SubscriptionApiCaller = (method: string, data: TelegramData) => Promise<{ data: boolean }> | undefined

interface TgSubscriptionContext {
  isTgSubscribed: boolean
  isCmsCallInProgress: boolean
  toggleSubscription(): Promise<void>
}

export function useTgSubscription(account: string | undefined, authorization: TgAuthorization): TgSubscriptionContext {
  const { tgData, authorize } = authorization
  const [isCmsCallInProgress, setIsCmsCallInProgress] = useState<boolean>(false)
  const [isTgSubscribed, setTgSubscribed] = useState<boolean>(false)

  const isSubscriptionCheckedRef = useRef(false)

  const callSubscriptionApi: SubscriptionApiCaller = useCallback(
    (method: string, data: TelegramData) => {
      if (!account) return

      setIsCmsCallInProgress(true)

      return getCmsClient()
        .POST(method, { body: { account, data } })
        .finally(() => {
          setIsCmsCallInProgress(false)
        })
    },
    [account],
  )

  const addTgSubscription = useCallback(
    (data: TelegramData) => {
      callSubscriptionApi('/add-tg-subscription', data)?.then(({ data: result }: { data: boolean }) => {
        setTgSubscribed(result)
      })
    },
    [callSubscriptionApi],
  )

  const removeSubscription = useCallback(
    (data: TelegramData) => {
      callSubscriptionApi('/remove-tg-subscription', data)?.then(({ data: result }: { data: boolean }) => {
        if (!result) return

        setTgSubscribed(false)
      })
    },
    [callSubscriptionApi],
  )

  const toggleSubscription = useCallback(async () => {
    const data = tgData || (await authorize())

    if (!data) return

    if (isTgSubscribed) {
      removeSubscription(data)
    } else {
      addTgSubscription(data)
    }
  }, [tgData, authorize, isTgSubscribed, addTgSubscription, removeSubscription])

  /**
   * Check the subscription once Telegram is authorized
   */
  useEffect(() => {
    if (!tgData || isSubscriptionCheckedRef.current) return

    isSubscriptionCheckedRef.current = true

    callSubscriptionApi('/check-tg-subscription', tgData)?.then(({ data: result }: { data: boolean }) => {
      setTgSubscribed(result)
    })
  }, [tgData, callSubscriptionApi])

  return useMemo(
    () => ({ isTgSubscribed, isCmsCallInProgress, toggleSubscription }),
    [isTgSubscribed, isCmsCallInProgress, toggleSubscription],
  )
}
