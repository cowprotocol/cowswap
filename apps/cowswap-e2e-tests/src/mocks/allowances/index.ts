import { decodeFunctionData, erc20Abi, toFunctionSelector } from 'viem'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { encodeAllowanceResult } from './codec'
import { loadAllowancesFixture, parseAllowanceValue } from './fixture'
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

  mockContractViewCall(context, undefined, selector, (callData, tokenAddress) => {
    const {
      args: [account],
    } = decodeFunctionData({
      abi: erc20Abi,
      data: callData,
    })

    if (!account) return

    // Which chain this `eth_call` actually went out on isn't derivable here: the app's own
    // real-RPC traffic doesn't reliably go through `REACT_APP_NETWORK_URL_<chainId>` — it lands
    // on whichever provider (Infura, a WalletConnect relay, publicnode, ...) the app's own client
    // picked, unpredictable and invisible from the call itself (see AGENTS.md). The token
    // *address*, unlike the chain, is right there in the call data and is unique per chain in
    // practice — this suite never seeds the same token address under two different chain ids in
    // one test — so match on `(owner, token)` alone instead of requiring an exact chain id.
    const mocked = findAllowance(fixture, overrides, account, tokenAddress)

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

/** Find an override/fixture entry by `(owner, token)` alone, across whichever chain id it was set under. */
function findAllowance(
  fixture: AllowanceLookup,
  overrides: AllowanceLookup,
  owner: string,
  token: string,
): bigint | undefined {
  const prefix = `${getAddressKey(owner)}|`
  const suffix = `|${getAddressKey(token)}`

  return findByPrefixAndSuffix(overrides, prefix, suffix) ?? findByPrefixAndSuffix(fixture, prefix, suffix)
}

function findByPrefixAndSuffix(lookup: AllowanceLookup, prefix: string, suffix: string): bigint | undefined {
  for (const [key, value] of lookup) {
    if (key.startsWith(prefix) && key.endsWith(suffix)) return value
  }
  return undefined
}
