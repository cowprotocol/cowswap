import { loadFixture } from './loadFixture'

import type { BrowserContext, Route } from '@playwright/test'

// The 1click SDK's `OpenAPI.BASE` — see `NearIntentsBridgeProvider` in `@cowprotocol/sdk-bridging`.
const NEAR_INTENTS_URL_PATTERN = /^https:\/\/1click\.chaindefuser\.com\/v0\//i

export interface NearIntentsMock {
  reset(): void
}

export function installNearIntents(context: BrowserContext): NearIntentsMock {
  const tokensFixture = loadFixture('near-dest-tokens.json')
  // `quote` and `attestation` are served byte-for-byte and paired: the SDK recovers a
  // signer address from `attestation.signature` over a hash of the *exact* quote fields
  // (`hashQuote({ quote, quoteRequest, timestamp })` in `@cowprotocol/sdk-bridging`) and rejects
  // the quote unless that recovered address matches Near's hardcoded attestor address. Both
  // fixtures were captured together from the real API — changing either one independently
  // (including the quote's numeric fields) invalidates the signature and breaks every test that
  // reaches this quote.
  const quoteFixture = loadFixture('near-quote.json')
  const attestationFixture = loadFixture('near-attestation.json')

  void context.route(NEAR_INTENTS_URL_PATTERN, async (route: Route) => {
    const pathname = new URL(route.request().url()).pathname

    if (pathname.endsWith('/tokens')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tokensFixture) })
      return
    }
    if (pathname.endsWith('/quote')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(quoteFixture) })
      return
    }
    if (pathname.endsWith('/attestation')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(attestationFixture) })
      return
    }
    if (pathname.endsWith('/status')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'SUCCESS', quoteResponse: quoteFixture }),
      })
      return
    }
    await route.fallback()
  })

  return {
    reset() {
      // Fixtures are served as-is for every test — nothing mutable to reset yet.
    },
  }
}
