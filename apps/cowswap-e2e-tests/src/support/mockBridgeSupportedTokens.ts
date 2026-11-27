import type { BrowserContext } from '@playwright/test'

export interface MockedBridgeToken {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
}

/**
 * Stubs the Bungee/Socket bridge provider's `/dest-tokens` endpoint (`BungeeApi.getBuyTokens` in
 * `@cowprotocol/sdk-bridging`), which both `useBridgeSupportedTokens` (resolving/listing buyable
 * tokens on a target chain) and `useRoutesAvailability` (is this destination chain reachable at
 * all) call under the hood — mocking this one REST call satisfies both, since Bungee is the only
 * enabled provider (`bridgingSdk.setAvailableProviders([bungeeBridgeProvider.info.dappId])`).
 * Response shape: `{ success: true, result: TokenInfo[] }`, where the SDK maps each entry's
 * `logoURI` to `logoUrl` and otherwise passes it through as-is.
 */
export async function mockBridgeSupportedTokens(context: BrowserContext, tokens: MockedBridgeToken[]): Promise<void> {
  await context.route(/bungee-manual\/dest-tokens/i, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, result: tokens }),
    })
  })
}
