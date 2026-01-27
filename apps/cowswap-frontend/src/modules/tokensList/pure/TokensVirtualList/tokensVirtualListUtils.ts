import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'

import { TokensVirtualRow } from './types'

import { tokensListSorter } from '../../utils/tokensListSorter'

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
  suppressPinnedSections?: boolean
}

export function buildVirtualRows(params: BuildVirtualRowsParams): TokensVirtualRow[] {
  const {
    sortedTokens,
    favoriteTokens,
    recentTokens,
    hideFavoriteTokensTooltip,
    onClearRecentTokens,
    suppressPinnedSections,
  } = params

  const tokenRows = sortedTokens.map<TokensVirtualRow>((token) => ({ type: 'token', token }))

  if (suppressPinnedSections) {
    return tokenRows
  }

  const composedRows: TokensVirtualRow[] = []

  if (favoriteTokens?.length) {
    composedRows.push({
      type: 'favorite-section',
      tokens: favoriteTokens,
      hideTooltip: hideFavoriteTokensTooltip,
    })
  }

  if (recentTokens?.length) {
    composedRows.push({
      type: 'title',
      label: t`Recent`,
      actionLabel: t`Clear`,
      onAction: onClearRecentTokens,
    })
    recentTokens.forEach((token) => composedRows.push({ type: 'token', token }))
  }

  if (favoriteTokens?.length || recentTokens?.length) {
    composedRows.push({ type: 'title', label: t`All tokens` })
  }

  return [...composedRows, ...tokenRows]
}
