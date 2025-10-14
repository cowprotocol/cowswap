import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { TwapPartOrderItem, twapPartOrdersAtom } from '../state/twapPartOrdersAtom'

const EMPTY_PART_ITEMS: TwapPartOrderItem[] = []

export function useTwapPartOrdersList(): TwapPartOrderItem[] {
  const { account, chainId } = useWalletInfo()
  const twapPartOrders = useAtomValue(twapPartOrdersAtom)

  return useMemo(() => {
    if (!account || !chainId) return EMPTY_PART_ITEMS

    const accountLowerCase = account.toLowerCase()

    const orders = Object.values(twapPartOrders)

    return orders.flat().filter((order) => order.safeAddress === accountLowerCase && order.chainId === chainId)
  }, [account, chainId, twapPartOrders])
}
