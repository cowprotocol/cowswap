import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

import { TokensVirtualRow } from './types'

import { tokensListSorter } from '../../utils/tokensListSorter'
import { getNoRouteTooltip } from '../constants'

type BalancesMap = BalancesState['values'] | undefined

export function sortTokensByBalance(tokens: TokenWithLogo[], balances: BalancesMap): TokenWithLogo[] {
  if (!balances) {
    return tokens
  }

  const prioritized: TokenWithLogo[] = []
  const remainder: TokenWithLogo[] = []

  for (const token of tokens) {
    const hasBalance = Boolean(balances[token.address.toLowerCase()])
    if (hasBalance || getIsNativeToken(token)) {
      prioritized.push(token)
    } else {
      remainder.push(token)
    }
  }

  const sortedPrioritized = prioritized.length > 1 ? [...prioritized].sort(tokensListSorter(balances)) : prioritized

  return [...sortedPrioritized, ...remainder]
}

export interface BuildVirtualRowsParams {
  sortedTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[] | undefined
  recentTokens: TokenWithLogo[] | undefined
  hideFavoriteTokensTooltip: boolean
  onClearRecentTokens: () => void
  bridgeSupportedTokensMap: Record<string, boolean> | null
  areTokensFromBridge: boolean
}

export function buildVirtualRows(params: BuildVirtualRowsParams): TokensVirtualRow[] {
  const {
    sortedTokens,
    favoriteTokens,
    recentTokens,
    hideFavoriteTokensTooltip,
    onClearRecentTokens,
    bridgeSupportedTokensMap,
    areTokensFromBridge = false,
  } = params

  const tokenRows = sortedTokens.map<TokensVirtualRow>((token) => ({ type: 'token', token }))
  const composedRows: TokensVirtualRow[] = []

  if (favoriteTokens?.length) {
    composedRows.push({
      type: 'favorite-section',
      tokens: favoriteTokens,
      hideTooltip: hideFavoriteTokensTooltip,
    })
  }

  if (recentTokens?.length) {
    const noRouteTooltip = getNoRouteTooltip()

    composedRows.push({
      type: 'title',
      label: t`Recent`,
      actionLabel: t`Clear`,
      onAction: onClearRecentTokens,
    })

    recentTokens.forEach((token) => {
      // Guard: disable tokens without address (defensive, shouldn't happen but safer than allowing selection)
      if (!token.address) {
        composedRows.push({
          type: 'token',
          token,
          disabled: true,
          disabledReason: noRouteTooltip,
        })
        return
      }

      // Only disable if: in bridge mode AND map is loaded AND token not in map
      const shouldDisable =
        areTokensFromBridge &&
        bridgeSupportedTokensMap !== null &&
        !bridgeSupportedTokensMap[getAddressKey(token.address)]

      composedRows.push({
        type: 'token',
        token,
        disabled: shouldDisable,
        disabledReason: shouldDisable ? noRouteTooltip : undefined,
      })
    })
  }

  if (favoriteTokens?.length || recentTokens?.length) {
    composedRows.push({ type: 'title', label: t`All tokens` })
  }

  return [...composedRows, ...tokenRows]
}
