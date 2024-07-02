import { useAtomValue } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { activeTokensAtom } from '../../state/tokens/allTokensAtom'


export function useAllTokens(): TokenWithLogo[] {
  return useAtomValue(activeTokensAtom)
}
