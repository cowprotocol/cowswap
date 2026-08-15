import { getAddressKey } from '@cowprotocol/cow-sdk'

import { JsonRpcEntry, mockRpcNodeRequest } from '../support/mockRpcNodeRequest'

import type { BrowserContext } from '@playwright/test'

export interface EthGetCodeMock {
  /** Override the bytecode reported for `address` — e.g. a non-`'0x'` value to simulate a
   * smart-contract wallet instead of the default plain EOA. */
  set(address: string, code: string): void
  /** Drop every override, back to `'0x'` (plain EOA) for every address. */
  reset(): void
}

/**
 * `eth_getCode` (wallet-type detection, e.g. `useIsSmartContractWallet`-style checks run for the
 * connected wallet on most page loads) goes out as a single, standalone JSON-RPC call to whichever
 * real RPC/Infura endpoint the app's own independent client picked — not the wallet's own
 * `REACT_APP_NETWORK_URL_<chainId>`-overridden channel, and not batched via Multicall3 either (it's
 * its own top-level RPC method, not a contract `eth_call`), so none of the other mocks ever see it.
 * Traced with `logUnmockedRpcRequests`/`LOG_UNMOCKED_RPC=1`: it accounted for the large majority of
 * 429s from a real, rate-limited Infura key once enough parallel workers hit it at once under
 * `pnpm e2e`. This suite's mock wallet is always a plain EOA, so reporting no code (`'0x'`) for
 * every address by default removes that real dependency entirely. `set()` is there for a future
 * test that needs to simulate a smart-contract wallet instead.
 */
export function installEthGetCode(context: BrowserContext): EthGetCodeMock {
  const overrides = new Map<string, string>()

  // No other mock watches `eth_getCode`, so every call with this method is unambiguously ours.
  mockRpcNodeRequest(
    context,
    'eth_getCode',
    (entry) => resolveCode(entry, overrides),
    () => true,
  )

  return {
    set(address, code) {
      overrides.set(getAddressKey(address), code)
    },
    reset() {
      overrides.clear()
    },
  }
}

function resolveCode(entry: JsonRpcEntry, overrides: Map<string, string>): string {
  const address = entry.params?.[0]
  const override = address ? overrides.get(getAddressKey(address as string)) : undefined
  return override ?? '0x'
}
