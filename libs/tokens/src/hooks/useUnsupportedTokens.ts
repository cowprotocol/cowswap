import { useAtomValue } from 'jotai'
import { currentUnsupportedTokensAtom } from '../state/unsupportedTokensAtom'

export function useUnsupportedTokens() {
  return useAtomValue(currentUnsupportedTokensAtom)
}
