import { useAtomValue } from 'jotai'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { rwaTokensAtom } from '../../state/tokenLists/rwaTokensAtom'

export function useIsAnyOfTokensRWA(firstToken: Token | undefined, secondToken: Token | undefined): Token | undefined {
  const rwaTokens = useAtomValue(rwaTokensAtom)

  if (firstToken && rwaTokens.has(getAddressKey(firstToken.address))) return firstToken
  if (secondToken && rwaTokens.has(getAddressKey(secondToken.address))) return secondToken

  return undefined
}
