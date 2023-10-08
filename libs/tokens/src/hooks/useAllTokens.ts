import { TokensByAddress, tokensByAddressAtom } from '../state/tokensAtom'
import { useAtomValue } from 'jotai/index'

export function useAllTokens(): TokensByAddress {
  return useAtomValue(tokensByAddressAtom)
}
