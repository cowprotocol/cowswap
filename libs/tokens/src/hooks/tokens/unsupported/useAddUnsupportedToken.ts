import { useSetAtom } from 'jotai'

import { addUnsupportedTokenAtom } from '../../../state/tokens/unsupportedTokensAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAddUnsupportedToken() {
  return useSetAtom(addUnsupportedTokenAtom)
}
