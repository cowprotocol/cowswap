import { toFunctionSelector } from 'viem'

import type { RpcProxyHandle } from '../fixtures/rpcProxy'

const SOCKET_VERIFIER_ADDRESS = '0xa27a3f5a96df7d8be26ee2790999860c00eb688d'
// Both `nonpayable` with no outputs, called via `eth_call`; the SDK only checks the call doesn't
// revert (see `verifyBungeeBuildTxData` in `@cowprotocol/sdk-bridging`). Derived from the real
// signatures (note the SDK's own typo: `validateRotueId`, not `validateRouteId`) rather than
// hardcoded hex, so a signature change in the SDK surfaces as a diff here instead of silently
// going stale.
const STUBBED_SELECTORS = [
  toFunctionSelector('validateRotueId(bytes,uint32)'),
  toFunctionSelector('validateSocketRequest(bytes,(uint32,(uint256,address,uint256,address,bytes4)))'),
]

/**
 * `BungeeBridgeProvider.getQuote()` verifies the build-tx it gets from Bungee's API by reading two
 * functions on the on-chain SocketVerifier contract, on the origin chain — Near Intents never does
 * this. This is *not* a call this suite's own read-only viem client makes on the app's behalf: the
 * SDK adapter's `readContract` here runs against the **connected wallet's own provider**, not a
 * separate HTTP transport — confirmed after `context.route()`-based interception (matching on the
 * page's own network requests) turned out to miss it entirely under load, because there's no page
 * network request to intercept in the first place. `eth_call`s made through the wallet's provider
 * go through `walletEngine.ts`'s `dispatch()` → `forward()`, a plain Node-side `fetch()` to this
 * suite's own RPC proxy (`support/rpcProxy.ts`) that never touches the browser's network layer at
 * all. `rpcProxy.stubCall()` is the proxy's own existing per-`(to, selector)` stub primitive — the
 * right layer to answer this, not a page-level route. Without it, the real call reverts with
 * `RouteIdNotFound()` and every Bungee quote fetch fails with `TX_BUILD_ERROR`.
 */
export async function mockSocketVerifier(rpcProxy: RpcProxyHandle, chainId: number): Promise<void> {
  for (const selector of STUBBED_SELECTORS) {
    await rpcProxy.stubCall({ chainId, to: SOCKET_VERIFIER_ADDRESS, dataPrefix: selector, returnHex: '0x' })
  }
}
