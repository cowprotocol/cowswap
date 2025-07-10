import { useAtomValue } from 'jotai/index'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { BridgeOrderQuoteData } from 'common/types/bridge'

import { bridgeOrderQuoteAtom } from './bridgeOrderQuoteAtom'

export function usePendingBridgeOrders(): BridgeOrderQuoteData[] | undefined {
  const { chainId, account } = useWalletInfo()

  const bridgeOrderQuote = useAtomValue(bridgeOrderQuoteAtom)

  return useMemo(() => {
    if (!account) return undefined

    return bridgeOrderQuote[chainId]?.[account]
  }, [bridgeOrderQuote, chainId, account])
}
