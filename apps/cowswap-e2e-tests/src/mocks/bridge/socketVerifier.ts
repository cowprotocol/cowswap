import { encodeAbiParameters, toFunctionSelector } from 'viem'

import { mockContractViewCall } from '../../support/mockContractViewCall'

import type { BrowserContext } from '@playwright/test'

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

const EMPTY_BYTES = encodeAbiParameters([{ type: 'uint256' }], [0n])

/**
 * Bungee's on-chain SocketVerifier check (`validateRotueId`/`validateSocketRequest`,
 * `verifyBungeeBuildTxData` in `@cowprotocol/sdk-bridging`). The app's own independent read-only
 * client can issue this as a real page-level `eth_call`, batched inside a Multicall3
 * `aggregate3`, on whatever real RPC host it picks for the connected chain — e.g.
 * `https://ethereum-rpc.publicnode.com` for Mainnet, the same host `REACT_APP_NETWORK_URL_1`
 * configures. Neither `mocks/allowances` (which owns that configured host) nor
 * `mocks/multicall3.ts` (which deliberately defers on any host `mocks/allowances` owns) has any
 * notion of these selectors, so without this mock the call forwards untouched to the real host —
 * a real, rate-limited dependency, same class of gap `installMulticall3`'s own doc comment
 * describes for unrecognized Multicall3 traffic in general. See `AGENTS.md`'s cross-chain
 * bridging section for this check's history — it also used to reach the network through the
 * connected wallet's own provider, a case this mock's page-network-layer `context.route()` can't
 * see at all, stubbed separately at the time; that stub was later deleted once this mock alone
 * proved sufficient.
 *
 * Host-agnostic and registered ahead of `installMulticall3`/`installAllowances` in the `mocks`
 * fixture (last registered wins in Playwright's LIFO route order), so it always gets first look:
 * it resolves any matching call locally — never touching the network — and falls back untouched
 * otherwise, the same shape as `ethBlockNumber.ts`/`ethGetCode.ts`.
 *
 * `mockContractViewCall` also registers this mock into `nestedRpcCallRegistry.ts` automatically,
 * so a *different* mock with its own separate batch-merge logic (`mockEthFlowTransaction.ts`'s
 * `installNativeBalanceRoute`) can still answer a SocketVerifier slot correctly when it lands in
 * the same `aggregate3` batch as that mock's own `getEthBalance` — without either file importing
 * the other's selectors or addresses.
 */
export function installSocketVerifier(context: BrowserContext): void {
  mockContractViewCall(context, SOCKET_VERIFIER_ADDRESS, STUBBED_SELECTORS[0], () => EMPTY_BYTES)
  mockContractViewCall(context, SOCKET_VERIFIER_ADDRESS, STUBBED_SELECTORS[1], () => EMPTY_BYTES)
}
