import { useAtomValue } from 'jotai'

import { getAddressKey, Nullish } from '@cowprotocol/cow-sdk'

import { rwaTokensAtom } from '../../state/tokenLists/rwaTokensAtom'

export function useIsRwaToken(token: Nullish<{ address: string }>): boolean {
  const rwaTokens = useAtomValue(rwaTokensAtom)

  return !!token && rwaTokens.has(getAddressKey(token.address))
}
