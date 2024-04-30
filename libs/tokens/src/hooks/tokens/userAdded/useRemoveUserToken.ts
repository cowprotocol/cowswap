import { useSetAtom } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { removeUserTokenAtom } from '../../../state/tokens/userAddedTokensAtom'

export function useRemoveUserToken(): (token: TokenWithLogo) => void {
  const removeUserToken = useSetAtom(removeUserTokenAtom)

  return (token: TokenWithLogo) => {
    removeUserToken(token)
  }
}
