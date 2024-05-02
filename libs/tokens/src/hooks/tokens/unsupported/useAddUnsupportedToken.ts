import { useSetAtom } from 'jotai'

import { addUnsupportedTokenAtom } from '../../../state/tokens/unsupportedTokensAtom'

export function useAddUnsupportedToken() {
  return useSetAtom(addUnsupportedTokenAtom)
}
