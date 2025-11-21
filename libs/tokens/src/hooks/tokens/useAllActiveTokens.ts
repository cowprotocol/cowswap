import { useAtomValue } from 'jotai'
import { unstable_unwrap } from 'jotai/utils'

import { environmentAtom } from '../../state/environmentAtom'
import { allActiveTokensAtom } from '../../state/tokens/allTokensAtom'
import { ActiveTokensState } from '../../types'

const unwrappedAllActiveTokensAtom = unstable_unwrap(allActiveTokensAtom, (prev?: ActiveTokensState) => prev)

export function useAllActiveTokens(): ActiveTokensState {
  const { chainId } = useAtomValue(environmentAtom)
  const result = useAtomValue(unwrappedAllActiveTokensAtom)

  if (result) {
    return result
  }

  return { tokens: [], chainId }
}
