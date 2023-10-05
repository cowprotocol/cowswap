import { useAtomValue } from 'jotai'
import { activeTokensAtom } from '../state/tokensAtom'

import { TokenWithLogo } from '@cowprotocol/common-const'

export function useActiveTokens(): TokenWithLogo[] {
  return useAtomValue(activeTokensAtom)
}
