import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

import { appendImportSection } from './helpers'
import { TokenSearchRow, UseSearchRowsParams } from './types'

import { getCheckingRouteTooltip, getNoRouteTooltip } from '../constants'

const SEARCH_RESULTS_LIMIT = 100

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
    const checkingRouteTooltip = getCheckingRouteTooltip()

    entries.push({ type: 'banner' })

    appendTokenRows({
      entries,
      tokens: matchedTokens,
      areTokensFromBridge,
      bridgeSupportedTokensMap,
      noRouteTooltip,
      checkingRouteTooltip,
    })

    appendTokenRows({
      entries,
      tokens: activeList,
      areTokensFromBridge,
      bridgeSupportedTokensMap,
      noRouteTooltip,
      checkingRouteTooltip,
    })

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

function appendTokenRows(params: {
  entries: TokenSearchRow[]
  tokens: TokenWithLogo[]
  areTokensFromBridge: boolean
  bridgeSupportedTokensMap: Record<string, boolean> | null | undefined
  noRouteTooltip: string
  checkingRouteTooltip: string
}): void {
  const { entries, tokens, areTokensFromBridge, bridgeSupportedTokensMap, noRouteTooltip, checkingRouteTooltip } =
    params

  for (const token of tokens) {
    const disabled = isTokenDisabledForBridge(token, areTokensFromBridge, bridgeSupportedTokensMap)

    entries.push({
      type: 'token',
      token,
      disabled,
      disabledReason: disabled
        ? bridgeSupportedTokensMap === null
          ? checkingRouteTooltip
          : noRouteTooltip
        : undefined,
    })
  }
}

function isTokenDisabledForBridge(
  token: TokenWithLogo,
  areTokensFromBridge: boolean,
  bridgeSupportedTokensMap: Record<string, boolean> | null | undefined,
): boolean {
  if (!areTokensFromBridge) {
    return false
  }

  // Guard: disable tokens without address
  if (!token.address) {
    return true
  }

  // If we're in bridge mode but the supported tokens map hasn't resolved yet,
  // block selections to avoid "select then reset" flicker once validation runs.
  if (bridgeSupportedTokensMap === null) {
    return true
  }

  if (!bridgeSupportedTokensMap) {
    return false
  }

  return !bridgeSupportedTokensMap[getAddressKey(token.address)]
}
