import { isEvmChain, type SupportedChainId } from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'

import { Nullish } from 'types'

import { ACCOUNT_PROXY_CONFIGS, getCowShedHooks } from 'modules/accountProxy'
import { BRIDGE_QUOTE_ACCOUNT } from 'modules/tradeQuote'

interface RestrictedAddressMatcher {
  address: string
  pattern: RegExp
}

const RESTRICTED_OWNERS = [PERMIT_ACCOUNT.address, BRIDGE_QUOTE_ACCOUNT]

const matchersCache = new Map<SupportedChainId, RestrictedAddressMatcher[]>()

/**
 * Looks for restricted addresses anywhere inside the values, so an address nested in calldata
 * or in an appData document (hooks, recipients, etc.) is found as well as a plain address field.
 */
export function findRestrictedAddress(values: Nullish<string>[], chainId: SupportedChainId): string | undefined {
  return getMatchers(chainId).find(({ pattern }) => values.some((value) => !!value && pattern.test(value)))?.address
}

export function getRestrictedAddresses(chainId: SupportedChainId): string[] {
  const proxies = isEvmChain(chainId)
    ? RESTRICTED_OWNERS.flatMap((owner) =>
        ACCOUNT_PROXY_CONFIGS.map((accountProxyConfig) =>
          getCowShedHooks({ chainId, accountProxyConfig }).proxyOf(owner),
        ),
      )
    : []

  return [...RESTRICTED_OWNERS, ...proxies]
}

function getMatchers(chainId: SupportedChainId): RestrictedAddressMatcher[] {
  const cached = matchersCache.get(chainId)

  if (cached) return cached

  const matchers = getRestrictedAddresses(chainId).map((address) => ({
    address,
    // Addresses are case-insensitive hex, and calldata embeds them without the 0x prefix
    pattern: new RegExp(address.slice(2), 'i'),
  }))

  matchersCache.set(chainId, matchers)

  return matchers
}
