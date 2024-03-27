import { atom, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { NATIVE_CURRENCIES, SWR_NO_REFRESH_OPTIONS, TokenWithLogo } from '@cowprotocol/common-const'
import { getImFeelingLuckySound } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAllTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'
import { Nullish } from 'types'

import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { useTradeState } from 'modules/trade/hooks/useTradeState'

import luckyTokens from './luckyTokens.tokenlist.json'

export function useImFeelingLucky() {
  const { state } = useTradeState()
  const inputCurrencyId = state?.inputCurrencyId
  const setWasImFeelingLuckyClicked = useSetAtom(wasImFeelingLuckyClickedAtom)

  const { chainId } = useWalletInfo()
  const navigate = useTradeNavigate()

  const tokens = useImFeelingLuckyTokens(chainId, inputCurrencyId)

  return useCallback(() => {
    const selected = pickRandom(tokens)

    getImFeelingLuckySound().play()
    setWasImFeelingLuckyClicked(true)
    navigate(chainId, {
      inputCurrencyId: inputCurrencyId || NATIVE_CURRENCIES[chainId].symbol || null,
      outputCurrencyId: selected?.symbol || null,
    })
  }, [tokens, setWasImFeelingLuckyClicked, navigate, chainId, inputCurrencyId])
}

function pickRandom<T>(list: T[]): T | undefined {
  if (list.length === 0) {
    return undefined
  }

  const randomIndex = Math.floor(Math.random() * list.length)
  return list[randomIndex]
}

function useImFeelingLuckyTokens(chainId: SupportedChainId, sellTokenId: Nullish<string>): TokenWithLogo[] {
  const isMainnet = chainId === SupportedChainId.MAINNET
  const tokens = useAllTokens().filter(
    ({ symbol, address }) =>
      symbol && !/uni|1inch|0x/.test(symbol.toLowerCase()) && symbol !== sellTokenId && address !== sellTokenId
  )

  const { data } = useSWR<TokenWithLogo[]>(
    'luckyTokens',
    () => luckyTokens.tokens.map((t) => TokenWithLogo.fromToken(t)),
    { ...SWR_NO_REFRESH_OPTIONS, fallbackData: [] }
  )

  if (isMainnet && data?.length) {
    return data.filter(sellTokenFilterFactory(sellTokenId))
  } else {
    return tokens
  }
}

function sellTokenFilterFactory(sellTokenId: Nullish<string>) {
  return ({ symbol, address }: TokenWithLogo) => symbol !== sellTokenId && address !== sellTokenId
}

export const wasImFeelingLuckyClickedAtom = atom(false)

export function useResetWasImFeelingLuckyClicked() {
  const setAtom = useSetAtom(wasImFeelingLuckyClickedAtom)

  return useCallback(() => setAtom(false), [setAtom])
}
