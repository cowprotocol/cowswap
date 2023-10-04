import { useSetAtom } from 'jotai'
import { resetUserTokenAtom } from '../state/userAddedTokensAtom'

export function useResetUserTokensCallback(): () => void {
  return useSetAtom(resetUserTokenAtom)
}
