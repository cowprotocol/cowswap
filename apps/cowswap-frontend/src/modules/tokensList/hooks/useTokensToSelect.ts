import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'
import { useAllActiveTokens, useFavoriteTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedTokens } from 'entities/bridgeProvider'
import { getAssetIdFromTokenTags, isNonEvmPrototypeEnabled } from 'prototype/nonEvmPrototype'

import { Field } from 'legacy/state/types'

import { SOLANA_CHAIN_ID } from 'common/chains/nonEvm'
import { SOLANA_SOL_ASSET_ID, SOLANA_USDC_ASSET_ID, getNonEvmAllowlist } from 'common/chains/nonEvmTokenAllowlist'

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
  const allowlistedAssetIds = useMemo(() => {
    if (!isNonEvmPrototypeEnabled()) return null

    const allowlist = getNonEvmAllowlist(selectedTargetChainId)
    if (!allowlist) return null

    return new Set(allowlist.tokens.map((token) => token.assetId))
  }, [selectedTargetChainId])

  const params: BuyTokensParams | undefined = useMemo(() => {
    if (!areTokensFromBridge) return undefined

    return { buyChainId: selectedTargetChainId, sellChainId: chainId }
  }, [areTokensFromBridge, chainId, selectedTargetChainId])

  const { data: result, isLoading } = useBridgeSupportedTokens(params)
  const bridgeTokens = result?.tokens ?? EMPTY_TOKENS
  const filteredBridgeTokens = useMemo(() => {
    if (!allowlistedAssetIds) return bridgeTokens

    return bridgeTokens.filter((token) => {
      const assetId = getAssetIdFromTokenTags(token.tags)

      return assetId ? allowlistedAssetIds.has(assetId) : false
    })
  }, [allowlistedAssetIds, bridgeTokens])

  const bridgeSupportedTokensMap = useMemo(() => {
    if (!filteredBridgeTokens.length) return null

    return filteredBridgeTokens.reduce<Record<string, boolean>>((acc, val) => {
      acc[val.address.toLowerCase()] = true
      return acc
    }, {})
  }, [filteredBridgeTokens])

  const prototypeFavoriteTokens = useMemo(() => {
    if (!areTokensFromBridge || !isNonEvmPrototypeEnabled()) return null
    if (selectedTargetChainId !== SOLANA_CHAIN_ID) return null

    const favoriteAssetIds = new Set([SOLANA_SOL_ASSET_ID, SOLANA_USDC_ASSET_ID])

    return filteredBridgeTokens.filter((token) => {
      const assetId = getAssetIdFromTokenTags(token.tags)

      return assetId ? favoriteAssetIds.has(assetId) : false
    })
  }, [areTokensFromBridge, filteredBridgeTokens, selectedTargetChainId])

  return useMemo(() => {
    const favoriteTokensToSelect = prototypeFavoriteTokens
      ? prototypeFavoriteTokens
      : bridgeSupportedTokensMap
        ? favoriteTokens.filter((token) => bridgeSupportedTokensMap[token.address.toLowerCase()])
        : favoriteTokens

    return {
      isLoading: areTokensFromBridge ? isLoading : false,
      tokens: (areTokensFromBridge ? filteredBridgeTokens : allTokens) || EMPTY_TOKENS,
      favoriteTokens: favoriteTokensToSelect,
      areTokensFromBridge,
      isRouteAvailable: areTokensFromBridge ? filteredBridgeTokens.length > 0 && result?.isRouteAvailable : undefined,
    }
  }, [
    allTokens,
    bridgeSupportedTokensMap,
    isLoading,
    areTokensFromBridge,
    favoriteTokens,
    filteredBridgeTokens,
    prototypeFavoriteTokens,
    result?.isRouteAvailable,
  ])
}
