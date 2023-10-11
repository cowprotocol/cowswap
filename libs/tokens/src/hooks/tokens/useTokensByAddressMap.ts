import { TokensByAddress, tokensByAddressAtom } from '../../state/tokens/allTokensAtom'
import { useAtomValue } from 'jotai'

export function useTokensByAddressMap(): TokensByAddress {
  return useAtomValue(tokensByAddressAtom)
}
