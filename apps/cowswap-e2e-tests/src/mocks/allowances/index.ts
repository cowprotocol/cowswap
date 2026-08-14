import { decodeFunctionData, erc20Abi, toFunctionSelector } from 'viem'

import { encodeAllowanceResult } from './codec'
import { loadAllowancesFixture, parseAllowanceValue } from './fixture'
import { allowanceKey, type AllowanceLookup, type AllowanceRead, type AllowanceValue } from './types'

import { CHAIN_IDS } from '../../support/constants'
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

// TODO: make chainId configurable
const CHAIN_ID = CHAIN_IDS.SEPOLIA

export function installAllowances(context: BrowserContext): AllowancesMock {
  const fixture = loadAllowancesFixture()
  const overrides: AllowanceLookup = new Map()
  const selector = toFunctionSelector('allowance(address,address)')

  mockContractViewCall(context, undefined, selector, (callData, tokenAddress) => {
    const {
      args: [account],
    } = decodeFunctionData({
      abi: erc20Abi,
      data: callData,
    })

    if (!account) return
    const key = allowanceKey(account, CHAIN_ID, tokenAddress)

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
