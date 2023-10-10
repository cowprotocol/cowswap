import { TokenWithLogo } from '@cowprotocol/common-const'
import { useSetAtom } from 'jotai'
import { addUserTokenAtom } from '../state/tokens/userAddedTokensAtom'

export function useImportTokenCallback(): (tokens: TokenWithLogo[]) => void {
  return useSetAtom(addUserTokenAtom)
}
