import { useAtomValue } from 'jotai/index'

import { isWrapOrUnwrapAtom } from '../state/isWrapOrUnwrapAtom'

export function useIsWrapOrUnwrap(): boolean {
  return useAtomValue(isWrapOrUnwrapAtom)
}
