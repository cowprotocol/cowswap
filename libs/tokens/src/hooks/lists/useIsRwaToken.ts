import { useAtomValue } from 'jotai'

import { getAddressKey, Nullish } from '@cowprotocol/cow-sdk'

import { rwaTokenAddressesAtom } from '../../state/tokenLists/rwaTokenAddressesAtom'

export function useIsRwaToken(token: Nullish<{ address: string }>): boolean {
  const rwaTokenAddresses = useAtomValue(rwaTokenAddressesAtom)

  return !!token && rwaTokenAddresses.has(getAddressKey(token.address))
}
