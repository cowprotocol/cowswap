import { useAtomValue } from 'jotai'

import { currentUnsupportedTokensAtom } from '../../../state/tokens/unsupportedTokensAtom'

export function useUnsupportedTokens() {
  return useAtomValue(currentUnsupportedTokensAtom)
}
