import { useAtomValue } from 'jotai'
import { activeTokensAtom } from '../state/tokens/tokensAtom'

import { TokenWithLogo } from '@cowprotocol/common-const'

export function useAllTokens(): TokenWithLogo[] {
  return useAtomValue(activeTokensAtom)
}
