import { useAtomValue } from 'jotai'

import { getTokenId, Nullish } from '@cowprotocol/cow-sdk'

import { rwaTokensAtom } from '../../state/tokenLists/rwaTokensAtom'

export function useIsRwaToken(token: Nullish<{ chainId: number; address: string }>): boolean {
  const rwaTokens = useAtomValue(rwaTokensAtom)

  return !!token && rwaTokens.has(getTokenId({ chainId: token.chainId, address: token.address }))
}
