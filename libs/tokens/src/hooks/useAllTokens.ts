import { TokensByAddress, tokensByAddressAtom } from '../state/tokens/tokensAtom'
import { useAtomValue } from 'jotai/index'

export function useAllTokens(): TokensByAddress {
  return useAtomValue(tokensByAddressAtom)
}
