import { useEffect } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getUnknownPrioritizedTokenKeys, useAreTokenListsLoading } from '@cowprotocol/tokens'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { getTokenSelectorFilter } from '../utils/filterTokensForSelector'

// The selector remounts on every open, so a ref would forget what was already logged
const loggedWarnings = new Set<string>()

export function usePrioritizedTokensWarning(chainId: number | undefined, tokens: TokenWithLogo[]): void {
  const widgetParams = useInjectedWidgetParams()
  const { field } = useSelectTokenWidgetState()
  const areTokenListsLoading = useAreTokenListsLoading()
  const { prioritizedTokens } = widgetParams
  // onlyWithBalance hides zero-balance prioritized tokens on purpose: they are filtered out, not missing
  const isFilteredByBalance = Boolean(getTokenSelectorFilter(field, widgetParams)?.onlyWithBalance)

  useEffect(() => {
    if (!prioritizedTokens || chainId === undefined || !tokens.length) return
    if (isFilteredByBalance || areTokenListsLoading) return

    const unknownKeys = getUnknownPrioritizedTokenKeys(prioritizedTokens, chainId, tokens)

    if (!unknownKeys.length) return

    const message = `[CoW widget] prioritizedTokens not found on chain ${chainId}: ${unknownKeys.join(', ')}. Add them with customTokens, or check they are on this network.`

    if (loggedWarnings.has(message)) return

    loggedWarnings.add(message)
    console.warn(message)
  }, [prioritizedTokens, chainId, tokens, isFilteredByBalance, areTokenListsLoading])
}
