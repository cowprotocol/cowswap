import { atom } from 'jotai'

import { rwaTokensAtom } from './rwaTokensAtom'

const XSTOCKS_ISSUER = 'xStocks'

/**
 * Address keys of the xStocks tokens on the current chain, recognized by the `issuer` extension of the
 * RWA lists.
 */
export const xstockTokenAddressesAtom = atom(async (get): Promise<Set<string>> => {
  const addresses = new Set<string>()

  for (const [addressKey, token] of await get(rwaTokensAtom)) {
    if (token.extensions?.['issuer'] === XSTOCKS_ISSUER) {
      addresses.add(addressKey)
    }
  }

  return addresses
})
