import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { areAddressesEqual, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

import { TokensVirtualRow } from './types'

import { tokensListSorter } from '../../utils/tokensListSorter'
import { getCheckingRouteTooltip, getNoRouteTooltip } from '../constants'

export interface BuildVirtualRowsParams {
  sortedTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[] | undefined
  recentTokens: TokenWithLogo[] | undefined
  hideFavoriteTokensTooltip: boolean
  onClearRecentTokens: () => void
  bridgeSupportedTokensMap: Record<string, boolean> | null
  areTokensFromBridge: boolean
  hideRecentTokens?: boolean
  hideFavoriteTokens?: boolean
}

type BalancesMap = BalancesState['values'] | undefined

// eslint-disable-next-line complexity
export function buildVirtualRows(params: BuildVirtualRowsParams): TokensVirtualRow[] {
  const {
    sortedTokens,
    favoriteTokens,
    recentTokens,
    hideFavoriteTokensTooltip,
    onClearRecentTokens,
    bridgeSupportedTokensMap,
    areTokensFromBridge = false,
    hideRecentTokens = false,
    hideFavoriteTokens = false,
  } = params

  const tokenRows = sortedTokens.map<TokensVirtualRow>((token) => ({ type: 'token', token }))
  const composedRows: TokensVirtualRow[] = []
  const hasFavoriteSection = !!favoriteTokens?.length && !hideFavoriteTokens
  const hasRecentSection = !!recentTokens?.length && !hideRecentTokens

  if (favoriteTokens?.length && !hideFavoriteTokens) {
    composedRows.push({
      type: 'favorite-section',
      tokens: favoriteTokens,
      hideTooltip: hideFavoriteTokensTooltip,
    })
  }

  if (recentTokens?.length && !hideRecentTokens) {
    const noRouteTooltip = getNoRouteTooltip()
    const checkingRouteTooltip = getCheckingRouteTooltip()

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

      // In bridge mode:
      // - While the map is loading (null), disable to prevent "select then reset".
      // - Once loaded, disable if token isn't bridgeable.
      const shouldDisable = areTokensFromBridge
        ? bridgeSupportedTokensMap === null
          ? true
          : bridgeSupportedTokensMap !== null && !bridgeSupportedTokensMap[getAddressKey(token.address)]
        : false

      composedRows.push({
        type: 'token',
        token,
        disabled: shouldDisable,
        disabledReason: shouldDisable
          ? bridgeSupportedTokensMap === null
            ? checkingRouteTooltip
            : noRouteTooltip
          : undefined,
      })
    })
  }

  if ((hasFavoriteSection || hasRecentSection) && tokenRows.length > 0) {
    composedRows.push({ type: 'title', label: t`All tokens` })
  }

  return [...composedRows, ...tokenRows]
}

export function sortTokensByBalance(tokens: TokenWithLogo[], balances: BalancesMap): TokenWithLogo[] {
  const hasRanks = tokens.some((token) => getSolanaTokenRank(token) !== Infinity)

  if (!balances && !hasRanks) {
    return tokens
  }

  const prioritized: TokenWithLogo[] = []
  const remainder: TokenWithLogo[] = []

  for (const token of tokens) {
    const hasBalance = Boolean(balances?.[getAddressKey(token.address)])
    if (hasBalance || getIsNativeToken(token)) {
      prioritized.push(token)
    } else {
      remainder.push(token)
    }
  }

  if (balances) {
    prioritized.sort(tokensListSorter(balances))
  }

  if (hasRanks) {
    remainder.sort(compareSolanaTokenRank)
  }

  return [...prioritized, ...remainder]
}

function compareSolanaTokenRank(a: TokenWithLogo, b: TokenWithLogo): number {
  const rankA = getSolanaTokenRank(a)
  const rankB = getSolanaTokenRank(b)

  if (rankA !== rankB) return rankA - rankB

  const symbolOrder = (a.symbol ?? '').localeCompare(b.symbol ?? '')
  if (symbolOrder) return symbolOrder
  if (areAddressesEqual(a.address, b.address)) return 0

  return a.sortsBefore(b) ? -1 : 1
}

function getSolanaTokenRank(token: TokenWithLogo): number {
  const rank = token.extensions?.rank

  return token.chainId === SupportedChainId.SOLANA && typeof rank === 'number' && Number.isSafeInteger(rank) && rank > 0
    ? rank
    : Infinity
}
