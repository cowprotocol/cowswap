import { useAtomValue } from 'jotai'

import { currentUnsupportedTokensAtom } from '../../../state/tokens/unsupportedTokensAtom'
import { UnsupportedTokensState } from '../../../types';

export function useUnsupportedTokens(): UnsupportedTokensState {
  return useAtomValue(currentUnsupportedTokensAtom) || {}
}
