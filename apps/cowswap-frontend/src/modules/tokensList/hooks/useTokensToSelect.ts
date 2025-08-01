import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { BuyTokensParams } from '@cowprotocol/cow-sdk'
import { useAllActiveTokens, useFavoriteTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedTokens } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

const EMPTY_TOKENS: TokenWithLogo[] = []

export interface TokensToSelectContext {
  isLoading: boolean
  tokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  areTokensFromBridge: boolean
}

export function useTokensToSelect(): TokensToSelectContext {
  const { chainId } = useWalletInfo()
  const favoriteTokens = useFavoriteTokens()
  const { selectedTargetChainId = chainId, field } = useSelectTokenWidgetState()
  const allTokens = useAllActiveTokens().tokens

  const areTokensFromBridge = field === Field.OUTPUT && selectedTargetChainId !== chainId

  const params: BuyTokensParams | undefined = useMemo(() => {
    if (!areTokensFromBridge) return undefined

    return { buyChainId: selectedTargetChainId, sellChainId: chainId }
  }, [areTokensFromBridge, chainId, selectedTargetChainId])

  const { data: bridgeSupportedTokens, isLoading } = useBridgeSupportedTokens(params)

  const bridgeSupportedTokensMap = useMemo(() => {
    return bridgeSupportedTokens?.reduce<Record<string, boolean>>((acc, val) => {
      acc[val.address.toLowerCase()] = true
      return acc
    }, {})
  }, [bridgeSupportedTokens])

  return useMemo(() => {
    const favoriteTokensToSelect = bridgeSupportedTokensMap
      ? favoriteTokens.filter((token) => bridgeSupportedTokensMap[token.address.toLowerCase()])
      : favoriteTokens

    return {
      isLoading: areTokensFromBridge ? isLoading : false,
      tokens: (areTokensFromBridge ? bridgeSupportedTokens : allTokens) || EMPTY_TOKENS,
      favoriteTokens: favoriteTokensToSelect,
      areTokensFromBridge,
    }
  }, [allTokens, bridgeSupportedTokens, bridgeSupportedTokensMap, isLoading, areTokensFromBridge, favoriteTokens])
}
