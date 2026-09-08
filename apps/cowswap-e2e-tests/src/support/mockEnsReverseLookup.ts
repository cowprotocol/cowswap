import { mockContractViewCall } from './mockContractViewCall'

import type { BrowserContext } from '@playwright/test'

/** ENS's Universal Resolver batch-gateway sentinel address — not a real deployed contract with
 * meaningful bytecode, just the fixed target wagmi/AppKit's reverse-ENS-name lookup calls (batched
 * via Multicall3) whenever the connected chain is Mainnet, to show an ENS name next to the
 * connected address in wallet-status UI. */
const ENS_BATCH_GATEWAY_ADDRESS = '0xeeeeeeee14D718C2B47D9923Deab1335e144EeEe'
/** The one selector this suite has observed that lookup call using (confirmed via
 * `LOG_UNMOCKED_RPC=1` against a real Mainnet-chain test) — not tied to a resolvable public ABI
 * signature, so matched by the raw selector rather than a named function. */
const REVERSE_LOOKUP_SELECTOR = '0xb7d6ca64'

/**
 * Stubs the ENS reverse-name-lookup call any Mainnet-chain test otherwise sends to a real,
 * unmocked `mainnet.infura.io` — this suite's own AGENTS.md documents that shared, rate-limited
 * Infura key as a confirmed source of CI flakiness once enough concurrent workers each trigger
 * their own real-RPC fallback. Answers with empty bytes: this lookup is purely cosmetic (an ENS
 * name shown next to the connected address) and never asserted on here, and a mock wallet's
 * throwaway test address has no real ENS name to resolve regardless.
 */
export function mockEnsReverseLookup(context: BrowserContext): void {
  mockContractViewCall(context, ENS_BATCH_GATEWAY_ADDRESS, REVERSE_LOOKUP_SELECTOR, () => '0x')
}
