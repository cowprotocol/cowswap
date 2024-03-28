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

import gchainAddresses from './gchainTokenAddresses.json'
import mainnetLuckyTokens from './luckyTokens.tokenlist.json'

const GCHAIN_ADDRESS = new Set(gchainAddresses)

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
      outputCurrencyId: selected?.address || null,
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
  const isGchain = chainId === SupportedChainId.GNOSIS_CHAIN

  const tokens = useAllTokens()

  const { data: mainnetList } = useSWR<TokenWithLogo[]>(
    'luckyTokens',
    () => mainnetLuckyTokens.tokens.map((t) => TokenWithLogo.fromToken(t)),
    { ...SWR_NO_REFRESH_OPTIONS, fallbackData: [] }
  )

  if (isMainnet && mainnetList?.length) {
    return mainnetList.filter(sellTokenFilterFactory(sellTokenId))
  } else if (isGchain) {
    return tokens
      .filter(({ address }) => GCHAIN_ADDRESS.has(address.toLowerCase()))
      .filter(sellTokenFilterFactory(sellTokenId))
  }
  return tokens.filter(sellTokenFilterFactory(sellTokenId))
}

function sellTokenFilterFactory(sellTokenId: Nullish<string>) {
  return ({ symbol, address }: TokenWithLogo) => symbol !== sellTokenId && address !== sellTokenId
}

export const wasImFeelingLuckyClickedAtom = atom(false)

export function useResetWasImFeelingLuckyClicked() {
  const setAtom = useSetAtom(wasImFeelingLuckyClickedAtom)

  return useCallback(() => setAtom(false), [setAtom])
}
