import { useCallback } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getImFeelingLuckySound } from '@cowprotocol/common-utils'
import { useAllTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { useTradeState } from 'modules/trade/hooks/useTradeState'

export function useImFeelingLucky() {
  const { state } = useTradeState()
  const inputCurrencyId = state?.inputCurrencyId

  // TODO: use the correct list
  const tokens = useAllTokens().filter(
    ({ symbol, address }) =>
      symbol && !/uni|1inch|0x/.test(symbol) && symbol !== inputCurrencyId && address !== inputCurrencyId
  )
  const { chainId } = useWalletInfo()
  const navigate = useTradeNavigate()

  return useCallback(() => {
    const selected = pickRandom(tokens)

    getImFeelingLuckySound().play()
    navigate(chainId, {
      inputCurrencyId: inputCurrencyId || NATIVE_CURRENCIES[chainId].symbol || null,
      outputCurrencyId: selected?.symbol || null,
    })
  }, [chainId, navigate, inputCurrencyId, tokens])
}

function pickRandom<T>(list: T[]): T | undefined {
  if (list.length === 0) {
    return undefined
  }

  const randomIndex = Math.floor(Math.random() * list.length)
  return list[randomIndex]
}
