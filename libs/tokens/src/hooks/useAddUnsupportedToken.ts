import { useSetAtom } from 'jotai'
import { addUnsupportedTokenAtom } from '../state/unsupportedTokensAtom'

export function useAddUnsupportedToken() {
  return useSetAtom(addUnsupportedTokenAtom)
}
