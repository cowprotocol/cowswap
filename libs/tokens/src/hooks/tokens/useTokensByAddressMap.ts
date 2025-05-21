import { useAtomValue } from 'jotai'

import { TokensByAddress, tokensByAddressAtom } from '../../state/tokens/allTokensAtom'

export function useTokensByAddressMap(): TokensByAddress {
  return useAtomValue(tokensByAddressAtom).tokens
}
