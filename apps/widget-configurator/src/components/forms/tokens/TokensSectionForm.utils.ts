import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { TokenListItem } from '../../../configurator.types'

export type TokenListScope = 'enabled' | 'enabledForSell' | 'enabledForBuy'

export function appendTokenListUrl(tokenListUrls: TokenListItem[], newListUrl: string): TokenListItem[] | null {
  const existing = tokenListUrls.find((list) => list.url.toLowerCase() === newListUrl.toLowerCase())

  if (existing) return null

  return [...tokenListUrls, { url: newListUrl, enabled: true, enabledForSell: false, enabledForBuy: false }]
}

export function getPrioritizedTokensParam(
  textByChain: Partial<Record<SupportedChainId, string>>,
): CowSwapWidgetParams['prioritizedTokens'] {
  const entries = Object.entries(textByChain)
    .map(([chainId, text]): [string, string[]] => [
      chainId,
      (text ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    ])
    .filter(([, addresses]) => addresses.length > 0)

  return entries.length ? (Object.fromEntries(entries) as CowSwapWidgetParams['prioritizedTokens']) : undefined
}

export function getSelectedTokenListUrls(tokenListUrls: TokenListItem[], scope: TokenListScope): string[] {
  return tokenListUrls.filter((list) => list[scope]).map((list) => list.url)
}

export function getTokenListOptions(
  tokenListUrls: TokenListItem[],
  scope: TokenListScope,
): { label: string; value: string }[] {
  return [...tokenListUrls]
    .sort((a, b) => {
      if (a[scope] === b[scope]) {
        return a.url.localeCompare(b.url)
      }

      return a[scope] ? -1 : 1
    })
    .map((list) => ({ label: list.url, value: list.url }))
}

export function updateTokenListScope(
  tokenListUrls: TokenListItem[],
  scope: TokenListScope,
  selectedUrls: string[],
): TokenListItem[] {
  return tokenListUrls.map((list) => ({ ...list, [scope]: selectedUrls.includes(list.url) }))
}
