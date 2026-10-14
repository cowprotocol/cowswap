import { useAtomValue } from 'jotai'

import { getAddressKey, Nullish } from '@cowprotocol/cow-sdk'

import { xstockTokenAddressesAtom } from '../../state/tokenLists/xstockTokenAddressesAtom'

export function useIsXstockToken(token: Nullish<{ address: string }>): boolean {
  const xstockTokenAddresses = useAtomValue(xstockTokenAddressesAtom)

  return !!token && xstockTokenAddresses.has(getAddressKey(token.address))
}
