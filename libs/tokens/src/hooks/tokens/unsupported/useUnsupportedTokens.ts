import { useAtomValue } from 'jotai'

import { currentUnsupportedTokensAtom } from '../../../state/tokens/unsupportedTokensAtom'
import { UnsupportedTokensState } from '@cowprotocol/tokens'

export function useUnsupportedTokens(): UnsupportedTokensState {
  return useAtomValue(currentUnsupportedTokensAtom) || {}
}
