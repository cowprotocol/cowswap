import { TokensByAddress, tokensByAddressAtom } from '../state/tokens/tokensAtom'
import { useAtomValue } from 'jotai'

export function useTokensByAddressMap(): TokensByAddress {
  return useAtomValue(tokensByAddressAtom)
}
