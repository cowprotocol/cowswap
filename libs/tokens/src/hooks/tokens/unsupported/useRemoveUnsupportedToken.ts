import { useSetAtom } from 'jotai'
import { removeUnsupportedTokenAtom } from '../../../state/tokens/unsupportedTokensAtom'

export function useRemoveUnsupportedToken() {
  return useSetAtom(removeUnsupportedTokenAtom)
}
