import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { tokensByAddressAtom } from '@cowprotocol/tokens'
import type { TokensByAddress } from '@cowprotocol/tokens'

import { getTokensListFromOrders } from 'modules/orders'

import { tokenQueryFamily, tokenKey } from 'common/state/tokenByAddressQuery.atom'

import { twapOrdersListAtom } from '../index'

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
