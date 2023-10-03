import { useAtomValue } from 'jotai'
import { TokenWithLogo } from '../types'
import { userAddedTokensListAtom } from '../state/userAddedTokensAtom'

export function useUserAddedTokens(): TokenWithLogo[] {
  return useAtomValue(userAddedTokensListAtom)
}
