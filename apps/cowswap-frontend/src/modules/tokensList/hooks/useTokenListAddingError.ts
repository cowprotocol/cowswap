import { useAtom } from 'jotai'

import { tokenListAddingErrorAtom } from '../state/tokenListAddingErrorAtom'

export function useTokenListAddingError() {
  return useAtom(tokenListAddingErrorAtom)
}
