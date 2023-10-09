import { useSetAtom } from 'jotai'
import { resetUserTokenAtom } from '../state/tokens/userAddedTokensAtom'

export function useResetUserTokensCallback(): () => void {
  return useSetAtom(resetUserTokenAtom)
}
