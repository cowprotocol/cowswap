import { useAtomValue } from 'jotai'
import { activeTokensAtom } from '../../state/tokens/allTokensAtom'

import { TokenWithLogo } from '@cowprotocol/common-const'

export function useAllTokens(): TokenWithLogo[] {
  return useAtomValue(activeTokensAtom)
}
