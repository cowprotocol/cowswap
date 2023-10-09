import { TokensByAddress, tokensByAddressAtom } from '../state/tokens/tokensAtom'
import { useAtomValue } from 'jotai'

export function useAllTokens(): TokensByAddress {
  return useAtomValue(tokensByAddressAtom)
}
