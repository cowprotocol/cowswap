import { useMemo } from 'react'

import { UiOrderType } from '@cowprotocol/types'
import { useIsSafeWallet, useIsTxBundlingSupported, useWalletInfo } from '@cowprotocol/wallet'

import { useTwapOrdersTokens } from 'entities/twap'

import { Order } from 'legacy/state/orders/actions'
import { useOrders } from 'legacy/state/orders/hooks'

import { useEmulatedPartOrders } from './useEmulatedPartOrders'
import { useEmulatedTwapOrders } from './useEmulatedTwapOrders'
import { useIsTwapEoaPrototypeEnabled } from './useIsTwapEoaPrototypeEnabled'

export function useAllEmulatedOrders(): Order[] {
  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const twapOrdersTokens = useTwapOrdersTokens()
  const emulatedTwapOrders = useEmulatedTwapOrders(twapOrdersTokens)
  const emulatedPartOrders = useEmulatedPartOrders(twapOrdersTokens)
  const isBundlingSupported = useIsTxBundlingSupported()
  const isTwapEoaPrototypeEnabled = useIsTwapEoaPrototypeEnabled()

  const twapOrders = useOrders(chainId, account, UiOrderType.TWAP)

  const discreteTwapOrders = useMemo(() => {
    return twapOrders.filter((order) => order.composableCowInfo?.isVirtualPart === false)
  }, [twapOrders])

  return useMemo(() => {
    if (!isBundlingSupported && !(isTwapEoaPrototypeEnabled && !isSafeWallet)) return []

    return emulatedTwapOrders.concat(emulatedPartOrders).concat(discreteTwapOrders)
  }, [
    discreteTwapOrders,
    emulatedPartOrders,
    emulatedTwapOrders,
    isBundlingSupported,
    isSafeWallet,
    isTwapEoaPrototypeEnabled,
  ])
}
