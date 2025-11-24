import { useEffect, useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'
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
  isRouteAvailable: boolean | undefined
}

export function useTokensToSelect(): TokensToSelectContext {
  const { chainId } = useWalletInfo()
  const favoriteTokens = useFavoriteTokens()
  const { selectedTargetChainId = chainId, field } = useSelectTokenWidgetState()
  const allTokens = useAllActiveTokens().tokens

  const areTokensFromBridge = field === Field.OUTPUT && selectedTargetChainId !== chainId
  const [cachedBridgeTokens, setCachedBridgeTokens] = useState<Record<number, TokenWithLogo[]>>({})

  const params: BuyTokensParams | undefined = useMemo(() => {
    if (!areTokensFromBridge) return undefined

    return { buyChainId: selectedTargetChainId, sellChainId: chainId }
  }, [areTokensFromBridge, chainId, selectedTargetChainId])

  const { data: result, isLoading } = useBridgeSupportedTokens(params)

  useEffect(() => {
    if (areTokensFromBridge && result?.tokens?.length) {
      setCachedBridgeTokens((prev) => {
        if (prev[selectedTargetChainId] === result.tokens) return prev
        return { ...prev, [selectedTargetChainId]: result.tokens }
      })
    }
  }, [areTokensFromBridge, result, selectedTargetChainId])

  const bridgeSupportedTokensMap = useMemo(() => {
    const tokens = result?.tokens

    if (!tokens || !tokens.length) return null

    return tokens.reduce<Record<string, boolean>>((acc, val) => {
      acc[val.address.toLowerCase()] = true
      return acc
    }, {})
  }, [result])

  // eslint-disable-next-line complexity
  return useMemo(() => {
    const bridgeTokens = areTokensFromBridge ? result?.tokens || cachedBridgeTokens[selectedTargetChainId] : undefined
    // Only show the loader while the initial bridge-token request is pending and we have no cached tokens
    const bridgeLoading = areTokensFromBridge ? isLoading && !bridgeTokens : false

    const favoriteTokensToSelect = bridgeSupportedTokensMap
      ? favoriteTokens.filter((token) => bridgeSupportedTokensMap[token.address.toLowerCase()])
      : favoriteTokens

    return {
      isLoading: areTokensFromBridge ? bridgeLoading || isLoading : false,
      tokens: (areTokensFromBridge ? bridgeTokens : allTokens) || EMPTY_TOKENS,
      favoriteTokens: favoriteTokensToSelect,
      areTokensFromBridge,
      isRouteAvailable: result?.isRouteAvailable,
    }
  }, [
    allTokens,
    bridgeSupportedTokensMap,
    isLoading,
    areTokensFromBridge,
    favoriteTokens,
    result,
    selectedTargetChainId,
    cachedBridgeTokens,
  ])
}
