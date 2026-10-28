import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { BuyTokensParams } from '@cowprotocol/sdk-bridging'
import { useFavoriteTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TokenSelectorFilter } from '@cowprotocol/widget-lib'

import { useBridgeSupportedTokens } from 'entities/bridgeProvider'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { Field } from 'legacy/state/types'

import { useTokensBalancesCombined } from 'modules/combinedBalances'

import { useChainsToSelect } from './useChainsToSelect'
import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { tokensToSelectAtom } from '../state/tokensToSelectAtom'
import {
  filterTokensForSelector,
  getTokenSelectorFilter,
  isTokenSelectorFiltered,
} from '../utils/filterTokensForSelector'

const EMPTY_TOKENS: TokenWithLogo[] = []

export interface TokensToSelectContext {
  isLoading: boolean
  tokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  allowedRecentTokens: TokenWithLogo[] | undefined
  hasScopedListRestriction: boolean
  areTokensFromBridge: boolean
  isRouteAvailable: boolean | undefined
  bridgeSupportedTokensMap: Record<string, boolean> | null
}

interface SelectorTokensFilter {
  tokensFilter: TokenSelectorFilter | undefined
  /** `null` when the balances don't narrow the tokens */
  balances: Record<string, bigint | undefined> | null
  areBalancesLoading: boolean
}

export function useTokensToSelect(): TokensToSelectContext {
  const { chainId } = useWalletInfo()
  const favoriteTokens = useFavoriteTokens()
  const { selectedTargetChainId = chainId, field, oppositeToken } = useSelectTokenWidgetState()
  const { tokenLists, sellTokenLists, buyTokenLists } = useInjectedWidgetParams()
  const chainsToSelect = useChainsToSelect()
  const listTokens = useAtomValue(tokensToSelectAtom)
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
  const {
    tokensFilter,
    balances: filterBalances,
    areBalancesLoading,
  } = useSelectorTokensFilter(field, areTokensFromBridge)
  const hasScopedListRestriction =
    getHasScopedListRestriction(field, tokenLists, sellTokenLists, buyTokenLists) ||
    isTokenSelectorFiltered(tokensFilter)

  const allTokens = useMemo(
    () => filterTokensForSelector(listTokens, tokensFilter, filterBalances),
    [listTokens, tokensFilter, filterBalances],
  )

  const params: BuyTokensParams | undefined = useMemo(() => {
    if (!areTokensFromBridge) return undefined

    return { buyChainId: targetChainId, sellChainId: sourceChainId }
  }, [areTokensFromBridge, sourceChainId, targetChainId])

  const { data: result, isLoading } = useBridgeSupportedTokens(params)

  const bridgeSupportedTokensMap = useMemo(() => {
    const tokens = result?.tokens

    if (!tokens) return null // still loading

    return tokens.reduce<Record<string, boolean>>((acc, val) => {
      acc[getAddressKey(val.address)] = true
      return acc
    }, {})
  }, [result])

  const visibleTokens = useMemo(() => {
    if (!areTokensFromBridge) return allTokens

    return result?.tokens ? filterTokensForSelector(result.tokens, tokensFilter, filterBalances) : EMPTY_TOKENS
  }, [allTokens, areTokensFromBridge, result, tokensFilter, filterBalances])

  const allowedRecentTokens = hasScopedListRestriction ? allTokens : undefined

  return useMemo(() => {
    // Favorites are shortcuts, not permissions: keep them inside the field-scoped token set.
    // In bridge mode they must also be bridgeable for the current chain pair.
    const scopedTokenAddresses = new Set(allTokens.map((token) => getAddressKey(token.address)))
    const visibleTokenAddresses = new Set(visibleTokens.map((token) => getAddressKey(token.address)))
    const favoriteTokensToSelect =
      areTokensFromBridge && bridgeSupportedTokensMap === null
        ? EMPTY_TOKENS
        : favoriteTokens.filter((token) => {
            const address = getAddressKey(token.address)

            return visibleTokenAddresses.has(address) && (!areTokensFromBridge || scopedTokenAddresses.has(address))
          })

    return {
      isLoading: (areTokensFromBridge && isLoading) || areBalancesLoading,
      tokens: visibleTokens,
      favoriteTokens: favoriteTokensToSelect,
      allowedRecentTokens,
      hasScopedListRestriction,
      areTokensFromBridge,
      isRouteAvailable: result?.isRouteAvailable,
      bridgeSupportedTokensMap,
    }
  }, [
    allTokens,
    allowedRecentTokens,
    bridgeSupportedTokensMap,
    favoriteTokens,
    hasScopedListRestriction,
    isLoading,
    areBalancesLoading,
    areTokensFromBridge,
    result,
    visibleTokens,
  ])
}

function getHasScopedListRestriction(
  field: Field | undefined,
  tokenLists: string[] | undefined,
  sellTokenLists: string[] | undefined,
  buyTokenLists: string[] | undefined,
): boolean {
  const applicableLists =
    field === Field.INPUT
      ? [tokenLists, sellTokenLists]
      : field === Field.OUTPUT
        ? [tokenLists, buyTokenLists]
        : [tokenLists, sellTokenLists, buyTokenLists]

  return applicableLists.some((lists) => Boolean(lists?.length))
}

function useSelectorTokensFilter(field: Field | undefined, areTokensFromBridge: boolean): SelectorTokensFilter {
  const { account } = useWalletInfo()
  const tokensFilter = getTokenSelectorFilter(field, useInjectedWidgetParams())
  const { values, hasFirstLoad } = useTokensBalancesCombined()
  // Balances are of the source network, so they can't narrow the bridge target tokens
  const isFilteredByBalance = Boolean(tokensFilter?.onlyWithBalance && account && !areTokensFromBridge)

  return {
    tokensFilter,
    balances: isFilteredByBalance ? values : null,
    areBalancesLoading: isFilteredByBalance && !hasFirstLoad,
  }
}
