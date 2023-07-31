import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'

import { Order } from 'legacy/state/orders/actions'
import { useOrders } from 'legacy/state/orders/hooks'

import { useIsSafeApp, useWalletInfo } from 'modules/wallet'

import { emulatedPartOrdersAtom } from '../state/emulatedPartOrdersAtom'
import { emulatedTwapOrdersAtom } from '../state/emulatedTwapOrdersAtom'

export function useEmulatedOrders(): Order[] {
  const { chainId, account } = useWalletInfo()
  const emulatedTwapOrders = useAtomValue(emulatedTwapOrdersAtom)
  const emulatedPartOrders = useAtomValue(emulatedPartOrdersAtom)
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
