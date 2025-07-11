import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { BridgeQuoteAmounts } from 'common/types/bridge'

import { bridgeOrderQuoteAtom } from './bridgeOrderQuoteAtom'

export function useBridgeOrderQuote(orderUid: string | undefined): BridgeQuoteAmounts | undefined {
  const { chainId, account } = useWalletInfo()
  const bridgeOrderQuote = useAtomValue(bridgeOrderQuoteAtom)

  return useMemo(() => {
    if (!account || !orderUid) return undefined

    const orders = bridgeOrderQuote[chainId]?.[account]

    if (!orders) return undefined

    return orders.find((order) => order.orderUid === orderUid)?.amounts
  }, [bridgeOrderQuote, orderUid, chainId, account])
}
