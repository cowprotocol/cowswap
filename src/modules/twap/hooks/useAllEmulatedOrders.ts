import { useMemo } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'

import { Order } from 'legacy/state/orders/actions'
import { useOrders } from 'legacy/state/orders/hooks'

import { useIsSafeApp, useWalletInfo } from 'modules/wallet'

import { useEmulatedPartOrders } from './useEmulatedPartOrders'
import { useEmulatedTwapOrders } from './useEmulatedTwapOrders'

export function useAllEmulatedOrders(): Order[] {
  const { chainId, account } = useWalletInfo()
  const emulatedTwapOrders = useEmulatedTwapOrders()
  const emulatedPartOrders = useEmulatedPartOrders()
  const isSafeApp = useIsSafeApp()

  const limitOrders = useOrders(chainId, account, OrderClass.LIMIT)
  const discreteTwapOrders = useMemo(() => {
    return limitOrders.filter((order) => order.composableCowInfo?.isVirtualPart === false)
  }, [limitOrders])

  const allEmulatedOrders = useMemo(() => {
    if (!isSafeApp) return []

    return emulatedTwapOrders.concat(emulatedPartOrders).concat(discreteTwapOrders)
  }, [emulatedTwapOrders, emulatedPartOrders, discreteTwapOrders, isSafeApp])

  return allEmulatedOrders
}
