import { decodeFunctionData, erc20Abi, toFunctionSelector } from 'viem'

import { encodeAllowanceResult } from './codec'
import { loadAllowancesFixture, parseAllowanceValue } from './fixture'
import { normalizeRpcUrl, resolveRpcChainIds } from './rpcUrls'
import { allowanceKey, type AllowanceLookup, type AllowanceRead, type AllowanceValue } from './types'

import { mockContractViewCall } from '../../support/mockContractViewCall'

import type { BrowserContext } from '@playwright/test'

export type { AllowanceRead, AllowanceValue }

export interface AllowancesMock {
  /**
   * Merge raw-atom allowances into `(owner, chainId)`, token by token.
   *
   * The supported way to key on `wallet.address`, which is not knowable when the
   * committed fixture is written. Tokens not named keep their fixture value.
   */
  set(owner: string, chainId: number, allowances: Record<string, AllowanceValue>): void
  /** Drop every override, restoring the committed fixture. */
  clear(): void
  reset(): void
}

export function installAllowances(context: BrowserContext): AllowancesMock {
  const fixture = loadAllowancesFixture()
  const overrides: AllowanceLookup = new Map()
  const selector = toFunctionSelector('allowance(address,address)')
  // Which chain a call belongs to isn't in the call data at all — only the RPC endpoint it went
  // out on says that (`rpcUrls.ts`'s doc comment). Resolved once per install rather than per call:
  // env vars don't change mid-test.
  const rpcChainIds = resolveRpcChainIds()

  mockContractViewCall(context, undefined, selector, (callData, tokenAddress, requestUrl) => {
    const {
      args: [account],
    } = decodeFunctionData({
      abi: erc20Abi,
      data: callData,
    })

    if (!account) return

    // A chain this suite has no `REACT_APP_NETWORK_URL_<chainId>` override for isn't ours to
    // answer — same "deliberately does not intercept" contract as `unconfiguredChainIds`.
    const chainId = rpcChainIds.get(normalizeRpcUrl(requestUrl))
    if (chainId === undefined) return

    const key = allowanceKey(account, chainId, tokenAddress)

    const mocked = overrides.get(key) ?? fixture.get(key)

    return typeof mocked === 'bigint' ? encodeAllowanceResult(mocked) : undefined
  })

  return {
    set(owner, chainId, allowances) {
      for (const [token, value] of Object.entries(allowances)) {
        const where = `allowances.set("${owner}", ${chainId}, { "${token}" })`
        overrides.set(allowanceKey(owner, chainId, token), parseAllowanceValue(value, where))
      }
    },
    clear() {
      overrides.clear()
    },
    reset() {
      overrides.clear()
    },
  }
}
