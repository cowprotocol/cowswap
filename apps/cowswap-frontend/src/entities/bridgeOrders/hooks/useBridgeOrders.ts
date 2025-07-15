import { useAtomValue } from 'jotai/index'
import { useMemo } from 'react'

import { BridgeOrderData } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { bridgeOrdersAtom } from '../state/bridgeOrdersAtom'

export function useBridgeOrders(): BridgeOrderData[] | undefined {
  const { chainId, account } = useWalletInfo()

  const bridgeOrderQuote = useAtomValue(bridgeOrdersAtom)

  return useMemo(() => {
    if (!account) return undefined

    return bridgeOrderQuote[chainId]?.[account.toLowerCase()]
  }, [bridgeOrderQuote, chainId, account])
}
