import { useAtomValue } from 'jotai'

import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { TwapPartOrderItem, twapPartOrdersAtom } from '../state/twapPartOrdersAtom'

const EMPTY_PART_ITEMS: TwapPartOrderItem[] = []
const swrConfig = {
  fallbackData: EMPTY_PART_ITEMS,
}

export function useTwapPartOrdersList(): TwapPartOrderItem[] {
  const { account, chainId } = useWalletInfo()
  const twapPartOrders = useAtomValue(twapPartOrdersAtom)

  const result = useSWR(
    account ? [account, chainId, twapPartOrders, 'useTwapPartOrdersList'] : null,
    async ([account, chainId, twapPartOrders]) => {
      if (!account || !chainId) return EMPTY_PART_ITEMS

      const accountLowerCase = account.toLowerCase()

      const orders = Object.values(twapPartOrders)

      return orders.flat().filter((order) => order.safeAddress === accountLowerCase && order.chainId === chainId)
    },
    swrConfig,
  )

  return result.data
}
