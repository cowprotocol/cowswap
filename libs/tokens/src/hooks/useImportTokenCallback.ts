import { TokenWithLogo } from '@cowprotocol/common-const'
import { useSetAtom } from 'jotai'
import { addUserTokenAtom } from '../state/userAddedTokensAtom'

export function useImportTokenCallback(): (token: TokenWithLogo) => void {
  const addUserToken = useSetAtom(addUserTokenAtom)

  return (token: TokenWithLogo) => {
    addUserToken(token)
  }
}
