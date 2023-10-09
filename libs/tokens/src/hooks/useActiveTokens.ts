import { useAtomValue } from 'jotai'
import { activeTokensAtom } from '../state/tokens/tokensAtom'

import { TokenWithLogo } from '@cowprotocol/common-const'

export function useActiveTokens(): TokenWithLogo[] {
  return useAtomValue(activeTokensAtom)
}
