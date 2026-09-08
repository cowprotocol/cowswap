import { getAddressKey } from '@cowprotocol/cow-sdk'

import type { BrowserContext, Route } from '@playwright/test'

/**
 * Mocks the two network-backed USD price sources `UsdPricesUpdater` tries before falling back to
 * the CoW Protocol native price (already handled by `mocks.cowApi`'s `nativePrice` endpoint):
 * BFF (`:chainId/tokens/:address/usdPrice`, matched by path only — `REACT_APP_BFF_BASE_URL` can
 * point at a local proxy instead of the real `bff(.barn).cow.fi` host, and `:address` isn't
 * assumed to be a hex EVM address since non-EVM bridge destinations use their own native address
 * formats) and Defillama
 * (`coins.llama.fi/prices/current/:platform::address`).
 */
export interface UsdPricesMock {
  /** Sets a fixed USD price (served by both BFF and Defillama) for a token address. */
  setPrice(address: string, price: number): void
  /** Makes both BFF and Defillama report the token as unknown, forcing price resolution to fall through to (or fail past) the CoW native-price source. */
  setUnknown(address: string): void
  reset(): void
}

const DEFAULT_PRICE = 1
// Non-EVM bridge destinations (Bitcoin, Solana) are addressed by their own native formats, not a
// hex EVM address — e.g. BTC(OMNI)'s is `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`. `getAddressKey` (used
// below) already passes those through unchanged, so this only needs to avoid assuming hex.
const TOKEN_ADDRESS = '[^/]+'

export function installUsdPrices(context: BrowserContext): UsdPricesMock {
  const prices = new Map<string, number | null>()

  function priceFor(address: string): number | null {
    const key = getAddressKey(address)
    return prices.has(key) ? (prices.get(key) ?? null) : DEFAULT_PRICE
  }

  void context.route(new RegExp(`/\\d+/tokens/${TOKEN_ADDRESS}/usdPrice$`, 'i'), async (route: Route) => {
    const match = new RegExp(`tokens/(${TOKEN_ADDRESS})/usdPrice$`, 'i').exec(route.request().url())
    const price = priceFor(match?.[1] ?? '')

    if (price === null) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'not found' }),
      })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ price }) })
  })

  void context.route(/coins\.llama\.fi\/prices\/current\//i, async (route: Route) => {
    const key = new URL(route.request().url()).pathname.split('/prices/current/')[1] ?? ''
    const address = key.split(':')[1] ?? ''
    const price = priceFor(address)
    const coins = price === null ? {} : { [key]: { price } }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ coins }) })
  })

  return {
    setPrice(address, price) {
      prices.set(getAddressKey(address), price)
    },
    setUnknown(address) {
      prices.set(getAddressKey(address), null)
    },
    reset() {
      prices.clear()
    },
  }
}
