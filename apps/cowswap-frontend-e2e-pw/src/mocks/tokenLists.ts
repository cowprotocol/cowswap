import type { BrowserContext, Route } from '@playwright/test'

export interface TokenListsMock {
  setListForChain(
    chainId: number,
    list: {
      tokens: Array<{
        address: string
        symbol: string
        name: string
        decimals: number
        chainId: number
        logoURI?: string
      }>
    },
  ): void
  reset(): void
}

const EMPTY_LIST = {
  name: 'e2e-pw stub',
  timestamp: new Date().toISOString(),
  version: { major: 1, minor: 0, patch: 0 },
  tokens: [],
}

export function installTokenLists(context: BrowserContext): TokenListsMock {
  const byChain = new Map<number, unknown>()

  void context.route(/tokens.*\.json$/i, async (route: Route) => {
    const url = new URL(route.request().url())
    const chainMatch = url.pathname.match(/(\d+)/)
    const chainId = chainMatch ? Number.parseInt(chainMatch[1], 10) : 0
    const list = byChain.get(chainId) ?? EMPTY_LIST
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(list) })
  })

  return {
    setListForChain(chainId, list) {
      byChain.set(chainId, {
        name: `e2e-pw chain ${chainId}`,
        timestamp: new Date().toISOString(),
        version: { major: 1, minor: 0, patch: 0 },
        tokens: list.tokens,
      })
    },
    reset() {
      byChain.clear()
    },
  }
}
