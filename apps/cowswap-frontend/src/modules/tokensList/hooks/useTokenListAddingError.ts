import { useAtom } from 'jotai'

import { tokenListAddingErrorAtom } from '../state/tokenListAddingErrorAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useTokenListAddingError() {
  return useAtom(tokenListAddingErrorAtom)
}
