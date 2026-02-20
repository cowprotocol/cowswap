import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isEvmChain } from '@cowprotocol/cow-sdk'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'
import { useAllActiveTokens, useFavoriteTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedTokens } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { useChainsToSelect } from './useChainsToSelect'
import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

const EMPTY_TOKENS: TokenWithLogo[] = []

export interface TokensToSelectContext {
  isLoading: boolean
  tokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  areTokensFromBridge: boolean
  isRouteAvailable: boolean | undefined
  bridgeSupportedTokensMap: Record<string, boolean> | null
}

export function useTokensToSelect(): TokensToSelectContext {
  const { chainId } = useWalletInfo()
  const favoriteTokens = useFavoriteTokens()
  const { selectedTargetChainId = chainId, field, oppositeToken } = useSelectTokenWidgetState()
  const chainsToSelect = useChainsToSelect()
  const allTokens = useAllActiveTokens().tokens
  const targetChainId = chainsToSelect?.defaultChainId ?? selectedTargetChainId

  const sourceChainId = useMemo(() => {
    // When selecting the BUY token, the "opposite" token is the SELL token.
    // Use it as the source-of-truth for bridging so the selector stays correct even
    // when wallet network != trade (sell) network.
    if (field === Field.OUTPUT && oppositeToken) {
      return oppositeToken.chainId
    }

    return chainId
  }, [chainId, field, oppositeToken])

  const areTokensFromBridge = field === Field.OUTPUT && targetChainId !== sourceChainId

  const params: BuyTokensParams | undefined = useMemo(() => {
    if (!areTokensFromBridge) return undefined
    if (!isEvmChain(targetChainId)) return undefined

    return { buyChainId: targetChainId, sellChainId: sourceChainId }
  }, [areTokensFromBridge, sourceChainId, targetChainId])

  const { data: result, isLoading } = useBridgeSupportedTokens(params)

  const bridgeSupportedTokensMap = useMemo(() => {
    const tokens = result?.tokens

    if (!tokens) return null // still loading

    return tokens.reduce<Record<string, boolean>>((acc, val) => {
      acc[val.address.toLowerCase()] = true
      return acc
    }, {})
  }, [result])

  return useMemo(() => {
    // In bridge mode, hide favorites until we know what's actually bridgeable for this chain pair.
    // This avoids selecting a favorite token and then getting it cleared by async validation.
    const favoriteTokensToSelect =
      areTokensFromBridge && bridgeSupportedTokensMap === null
        ? EMPTY_TOKENS
        : bridgeSupportedTokensMap
          ? favoriteTokens.filter((token) => bridgeSupportedTokensMap[token.address.toLowerCase()])
          : favoriteTokens

    return {
      isLoading: areTokensFromBridge ? isLoading : false,
      tokens: (areTokensFromBridge ? result?.tokens : allTokens) || EMPTY_TOKENS,
      favoriteTokens: favoriteTokensToSelect,
      areTokensFromBridge,
      isRouteAvailable: result?.isRouteAvailable,
      bridgeSupportedTokensMap,
    }
  }, [allTokens, bridgeSupportedTokensMap, isLoading, areTokensFromBridge, favoriteTokens, result])
}
