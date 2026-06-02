import { TokenListItem } from '../../../../configurator.types'

export type TokenListScope = 'enabled' | 'enabledForSell' | 'enabledForBuy'

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

export function appendTokenListUrl(tokenListUrls: TokenListItem[], newListUrl: string): TokenListItem[] | null {
  const existing = tokenListUrls.find((list) => list.url.toLowerCase() === newListUrl.toLowerCase())

  if (existing) return null

  return [...tokenListUrls, { url: newListUrl, enabled: true, enabledForSell: false, enabledForBuy: false }]
}
