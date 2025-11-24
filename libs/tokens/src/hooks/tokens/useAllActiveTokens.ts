import { useAtomValue } from 'jotai'

import { allActiveTokensAtom } from '../../state/tokens/allTokensAtom'
import { ActiveTokensState } from '../../types'

export function useAllActiveTokens(): ActiveTokensState {
  return useAtomValue(allActiveTokensAtom)
}
