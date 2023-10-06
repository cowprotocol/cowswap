import { useSetAtom } from 'jotai'
import { removeUnsupportedTokenAtom } from '../state/unsupportedTokensAtom'

export function useRemoveUnsupportedToken() {
  return useSetAtom(removeUnsupportedTokenAtom)
}
