import { useSetAtom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { addUserTokenAtom } from '../../../state/tokens/userAddedTokensAtom'

export function useAddUserToken(): (tokens: TokenWithLogo[]) => void {
  return useSetAtom(addUserTokenAtom)
}
