import { useAtomValue } from 'jotai'

import { currentUnsupportedTokensAtom } from '../../../state/tokens/unsupportedTokensAtom'
import { UnsupportedTokensState } from '../../../types'

const DEFAULT_UNSUPPORTED_TOKENS_STATE: UnsupportedTokensState = {}

export function useUnsupportedTokens(): UnsupportedTokensState {
  return useAtomValue(currentUnsupportedTokensAtom) || DEFAULT_UNSUPPORTED_TOKENS_STATE
}
