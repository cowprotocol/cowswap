import { atom } from 'jotai'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { rwaTokensAtom } from './rwaTokensAtom'

import { environmentAtom } from '../environmentAtom'

const XSTOCKS_ISSUER = 'xStocks'

/**
 * Address keys of the xStocks tokens on the current chain, recognized by the `issuer` extension of the
 * RWA lists.
 */
export const xstockTokenAddressesAtom = atom(async (get): Promise<Set<string>> => {
  const { chainId } = get(environmentAtom)
  const addresses = new Set<string>()

  for (const token of (await get(rwaTokensAtom)).values()) {
    if (token.chainId === chainId && token.extensions?.['issuer'] === XSTOCKS_ISSUER) {
      addresses.add(getAddressKey(token.address))
    }
  }

  return addresses
})
