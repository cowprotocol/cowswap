import { useAtomValue } from 'jotai'

import { isWrapOrUnwrapAtom } from '../state/isWrapOrUnwrapAtom'

export function useIsWrapOrUnwrap(): boolean {
  return useAtomValue(isWrapOrUnwrapAtom)
}
