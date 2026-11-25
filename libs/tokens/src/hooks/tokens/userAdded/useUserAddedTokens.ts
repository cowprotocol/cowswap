import { useAtomValue } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { userAddedTokensListAtom } from '../../../state/tokens/allTokensAtom'

export function useUserAddedTokens(): TokenWithLogo[] {
  return useAtomValue(userAddedTokensListAtom)
}
