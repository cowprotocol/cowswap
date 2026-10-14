import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useChainId, useConnection, useSwitchChain } from 'wagmi'

import { tradeSideAtom, tradeTokenKeyAtom } from './tradeSelectionAtoms'

import { getTokenKey } from '../lib/tokenKey'

import type { TradeSide } from '../lib/tradeLeg'
import type { RwaToken } from '@/entities/asset'

export const TRADE_WIDGET_ID = 'trade-widget'

export function useSelectTradeToken(): (token: RwaToken, side: TradeSide) => void {
  const walletChainId = useChainId()
  const { isConnected } = useConnection()
  const { mutate: switchChain } = useSwitchChain()
  const setSide = useSetAtom(tradeSideAtom)
  const setTokenKey = useSetAtom(tradeTokenKeyAtom)

  return useCallback(
    (token: RwaToken, side: TradeSide) => {
      const select = (): void => {
        setSide(side)
        setTokenKey(getTokenKey(token))
      }

      // The widget follows the wallet chain: selecting before the switch would trade another token of the wallet chain
      if (isConnected && walletChainId !== token.chainId) {
        switchChain({ chainId: token.chainId }, { onSuccess: select })
      } else {
        select()
      }

      document.getElementById(TRADE_WIDGET_ID)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    },
    [isConnected, walletChainId, setSide, setTokenKey, switchChain],
  )
}
