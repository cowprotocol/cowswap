import { useAtomValue } from 'jotai'

import { getAddressKey, Nullish } from '@cowprotocol/cow-sdk'

import { rwaTokenAddressesAtom } from '../../state/tokenLists/rwaTokenAddressesAtom'

export function useIsRwaToken(token: Nullish<{ address: string }>): boolean {
  const rwaTokenAddresses = useRwaTokenAddresses()

  return !!token && rwaTokenAddresses.has(getAddressKey(token.address))
}

/** Address keys of every RWA list token, for callers that answer for several tokens at once. */
export function useRwaTokenAddresses(): Set<string> {
  return useAtomValue(rwaTokenAddressesAtom)
}
