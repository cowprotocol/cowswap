import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

import { appendImportSection } from './helpers'
import { TokenSearchRow, UseSearchRowsParams } from './types'

import { getNoRouteTooltip } from '../constants'

const SEARCH_RESULTS_LIMIT = 100

function isTokenDisabledForBridge(
  token: TokenWithLogo,
  areTokensFromBridge: boolean,
  bridgeSupportedTokensMap: Record<string, boolean> | null | undefined,
): boolean {
  // Only disable if: in bridge mode AND map is loaded AND token not in map
  if (!areTokensFromBridge || !bridgeSupportedTokensMap) {
    return false
  }

  // Guard: disable tokens without address
  if (!token.address) {
    return true
  }

  return !bridgeSupportedTokensMap[getAddressKey(token.address)]
}

export function useSearchRows({
  isLoading,
  matchedTokens,
  activeList,
  blockchainResult,
  inactiveListsResult,
  externalApiResult,
  bridgeSupportedTokensMap,
  areTokensFromBridge = false,
}: UseSearchRowsParams): TokenSearchRow[] {
  return useMemo(() => {
    const entries: TokenSearchRow[] = []

    if (isLoading) {
      return entries
    }

    const noRouteTooltip = getNoRouteTooltip()

    entries.push({ type: 'banner' })

    for (const token of matchedTokens) {
      const disabled = isTokenDisabledForBridge(token, areTokensFromBridge, bridgeSupportedTokensMap)
      entries.push({
        type: 'token',
        token,
        disabled,
        disabledReason: disabled ? noRouteTooltip : undefined,
      })
    }

    for (const token of activeList) {
      const disabled = isTokenDisabledForBridge(token, areTokensFromBridge, bridgeSupportedTokensMap)
      entries.push({
        type: 'token',
        token,
        disabled,
        disabledReason: disabled ? noRouteTooltip : undefined,
      })
    }

    appendImportSection(entries, {
      tokens: blockchainResult,
      section: 'blockchain',
      limit: SEARCH_RESULTS_LIMIT,
      sectionTitle: undefined,
      tooltip: undefined,
      shadowed: false,
      wrapperId: 'currency-import',
      bridgeSupportedTokensMap,
      areTokensFromBridge,
    })

    appendImportSection(entries, {
      tokens: inactiveListsResult,
      section: 'inactive',
      limit: SEARCH_RESULTS_LIMIT,
      sectionTitle: t`Expanded results from inactive Token Lists`,
      tooltip: t`Tokens from inactive lists. Import specific tokens below or click Manage to activate more lists.`,
      shadowed: true,
      bridgeSupportedTokensMap,
      areTokensFromBridge,
    })

    appendImportSection(entries, {
      tokens: externalApiResult,
      section: 'external',
      limit: SEARCH_RESULTS_LIMIT,
      sectionTitle: t`Additional Results from External Sources`,
      tooltip: t`Tokens from external sources.`,
      shadowed: true,
      bridgeSupportedTokensMap,
      areTokensFromBridge,
    })

    return entries
  }, [
    isLoading,
    matchedTokens,
    activeList,
    blockchainResult,
    inactiveListsResult,
    externalApiResult,
    bridgeSupportedTokensMap,
    areTokensFromBridge,
  ])
}
