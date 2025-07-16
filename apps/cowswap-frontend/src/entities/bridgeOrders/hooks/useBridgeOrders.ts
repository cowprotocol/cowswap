import { useAtomValue } from 'jotai/index'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { BridgeOrderData } from 'common/types/bridge'

import { bridgeOrdersAtom } from '../state/bridgeOrdersAtom'

export function useBridgeOrders(): BridgeOrderData[] | undefined {
  const { chainId, account } = useWalletInfo()

  const bridgeOrderQuote = useAtomValue(bridgeOrdersAtom)

  return useMemo(() => {
    if (!account) return undefined

    return bridgeOrderQuote[chainId]?.[account]
  }, [bridgeOrderQuote, chainId, account])
}
