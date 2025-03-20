import { useAtomValue } from 'jotai'

import { activeTokensAtom } from '../../state/tokens/allTokensAtom'
import { ActiveTokensState } from '../../types'

export function useAllActiveTokens(): ActiveTokensState {
  return useAtomValue(activeTokensAtom)
}
