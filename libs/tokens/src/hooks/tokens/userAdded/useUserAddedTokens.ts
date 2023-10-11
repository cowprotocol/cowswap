import { useAtomValue } from 'jotai'
import { userAddedTokensListAtom } from '../../../state/tokens/userAddedTokensAtom'
import { TokenWithLogo } from '@cowprotocol/common-const'

export function useUserAddedTokens(): TokenWithLogo[] {
  return useAtomValue(userAddedTokensListAtom)
}
