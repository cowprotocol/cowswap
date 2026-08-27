import { APPROVE_CALL_SUCCESS_RESULT, APPROVE_SELECTOR } from './mockApproveTransaction'
import { mockRpcNodeRequest } from './mockRpcNodeRequest'

import type { JsonRpcEntry } from './mockRpcNodeRequest'
import type { BrowserContext } from '@playwright/test'

/**
 * Answers the preflight `approve(address,uint256)` simulation `eth_call` (see
 * `mockApproveTransaction.ts`'s doc comment) for every trade that pre-seeds a sufficient
 * allowance via `seedTrader`/`mocks.allowances.set` and therefore never calls
 * `mockApproveTransaction` at all — the wallet-connector layer still fires this simulate-before-
 * sign check regardless of whether the UI ever shows an Approve step, and confirmed by tracing
 * real traffic (`LOG_UNMOCKED_RPC=1`), it goes to the app's own hardcoded provider rather than any
 * URL this suite controls, so it needs the same host-agnostic matching `mocks/socketVerifier.ts`
 * uses. Unlike `mockApproveTransaction`'s own per-token simulation stub, this one matches on the
 * selector alone — an ERC20 `approve()` call succeeding is safe to assume unconditionally
 * regardless of which token/spender it targets, and no test in this suite depends on one
 * reverting.
 */
export function mockApproveSimulation(context: BrowserContext): void {
  mockRpcNodeRequest(
    context,
    'eth_call',
    (entry) => (isApproveSimulationCall(entry) ? APPROVE_CALL_SUCCESS_RESULT : undefined),
    isApproveSimulationCall,
  )
}

/** Matches any `eth_call` whose calldata is an `approve(address,uint256)` invocation, regardless of `to`. */
function isApproveSimulationCall(entry: JsonRpcEntry | null | undefined): boolean {
  if (entry?.method !== 'eth_call') return false
  const call = entry.params?.[0] as { to?: string; data?: string } | undefined
  if (!call?.to || !call?.data) return false
  return call.data.toLowerCase().startsWith(APPROVE_SELECTOR)
}
