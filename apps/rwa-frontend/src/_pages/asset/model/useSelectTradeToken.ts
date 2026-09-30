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
      setSide(side)
      setTokenKey(getTokenKey(token))

      // The widget follows the wallet chain, so the token is only picked up once the wallet is on its chain
      if (isConnected && walletChainId !== token.chainId) switchChain({ chainId: token.chainId })

      document.getElementById(TRADE_WIDGET_ID)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    },
    [isConnected, walletChainId, setSide, setTokenKey, switchChain],
  )
}
