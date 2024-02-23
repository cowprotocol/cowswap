import { useMemo } from 'react'

import { UiOrderType } from '@cowprotocol/types'
import { useIsSafeApp, useWalletInfo } from '@cowprotocol/wallet'

import { Order } from 'legacy/state/orders/actions'
import { useOrders } from 'legacy/state/orders/hooks'

import { useEmulatedPartOrders } from './useEmulatedPartOrders'
import { useEmulatedTwapOrders } from './useEmulatedTwapOrders'
import { useTwapOrdersTokens } from './useTwapOrdersTokens'

export function useAllEmulatedOrders(): Order[] {
  const { chainId, account } = useWalletInfo()
  const twapOrdersTokens = useTwapOrdersTokens()
  const emulatedTwapOrders = useEmulatedTwapOrders(twapOrdersTokens)
  const emulatedPartOrders = useEmulatedPartOrders(twapOrdersTokens)
  const isSafeApp = useIsSafeApp()

  const twapOrders = useOrders(chainId, account, UiOrderType.TWAP)
  const discreteTwapOrders = useMemo(() => {
    return twapOrders.filter((order) => order.composableCowInfo?.isVirtualPart === false)
  }, [twapOrders])

  return useMemo(() => {
    if (!isSafeApp) return []

    return emulatedTwapOrders.concat(emulatedPartOrders).concat(discreteTwapOrders)
  }, [emulatedTwapOrders, emulatedPartOrders, discreteTwapOrders, isSafeApp])
}
