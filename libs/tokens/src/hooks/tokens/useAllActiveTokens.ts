import { useAtomValue } from 'jotai'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { activeTokensAtom } from '../../state/tokens/allTokensAtom'

export function useAllActiveTokens(): TokenWithLogo[] {
  return useAtomValue(activeTokensAtom)
}
