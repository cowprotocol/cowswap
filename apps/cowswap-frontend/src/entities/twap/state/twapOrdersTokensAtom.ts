import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { TokenWithLogo, getRpcProvider } from '@cowprotocol/common-const'
import { fetchTokenFromBlockchain, tokensByAddressAtom } from '@cowprotocol/tokens'
import type { TokensByAddress } from '@cowprotocol/tokens'

import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

import { getTokensListFromOrders } from 'modules/orders'

import { twapOrdersListAtom } from '../index'

// TODO: Move atoms to common/state/tokenByAddressQueryAtoms.ts:

function parseTokenKey(key: string): { chainId: number; address: string } {
  const [chainIdStr, address] = key.split('::')
  return { chainId: Number(chainIdStr), address: address ?? '' }
}

function tokenKey(chainId: number, address: string): string {
  return `${chainId}::${address.toLowerCase()}`
}

// TODO: Maybe it's better to just create a module that stores the fetched tokens in memory.
const tokenQueryFamily = atomFamily((key: string) =>
  atomWithQuery(() => {
    const { chainId, address } = parseTokenKey(key)

    return {
      queryKey: ['twapOrderToken', chainId, address],
      queryFn: async (): Promise<TokenWithLogo | null> => {
        const provider = getRpcProvider(chainId)

        if (!provider) return null

        // TODO M-6 COW-573
        // This flow will be reviewed and updated later, to include a wagmi alternative
        const token = await fetchTokenFromBlockchain(address, chainId, provider)

        return TokenWithLogo.fromToken(token)
      },
    }
  }),
)

// </end move>

const twapOrdersTokensAddressesAtom = atom((get) => getTokensListFromOrders(get(twapOrdersListAtom)))

const twapOrdersTokensAsyncAtom = atom(async (get): Promise<TokensByAddress | null> => {
  // TODO: Why do we read chainId from libs/tokens/src/state/environmentAtom.ts in here?
  const { tokens, chainId } = await get(tokensByAddressAtom)
  const twapOrdersTokensAddresses = get(twapOrdersTokensAddressesAtom)

  // TODO: Before, new tokens would be added using addUserTokenAtom, so the next time they'll be available from
  // tokensByAddressAtom. For now, we can skip that. Once everything's working again, we can consider moving
  // all token-related logic to query atoms.
  const twapOrdersTokens: TokensByAddress = {}

  let missingTokens = 0

  for (const tokensAddresses of twapOrdersTokensAddresses) {
    const keyLower = tokensAddresses.toLowerCase()

    if (tokens[keyLower]) {
      twapOrdersTokens[keyLower] = tokens[keyLower]
    } else {
      const tokenQueryAtom = tokenQueryFamily(tokenKey(chainId, keyLower))
      const queryResult = get(tokenQueryAtom)

      if (queryResult.data) {
        twapOrdersTokens[keyLower] = queryResult.data
      } else {
        ++missingTokens
      }
    }
  }

  if (missingTokens > 0) return null

  const expectedAddresses = [...twapOrdersTokensAddresses.map((addr) => addr.toLowerCase())].sort().join('::')
  const loadedAddresses = Object.keys(twapOrdersTokens).sort().join('::')

  if (expectedAddresses !== loadedAddresses) {
    console.error('Tokens finished loading but addresses mismatch:', { expectedAddresses, loadedAddresses })
    return null
  }

  return twapOrdersTokens
})

const twapOrdersTokensLoadableAtom = loadable(twapOrdersTokensAsyncAtom)

export const twapOrdersTokensAtom = atom((get): TokensByAddress | null => {
  const loadableState = get(twapOrdersTokensLoadableAtom)
  return loadableState.state === 'hasData' ? loadableState.data : null
})
