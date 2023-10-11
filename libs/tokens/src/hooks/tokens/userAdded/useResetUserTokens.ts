import { useSetAtom } from 'jotai'
import { resetUserTokensAtom } from '../../../state/tokens/userAddedTokensAtom'

export function useResetUserTokens(): () => void {
  return useSetAtom(resetUserTokensAtom)
}
