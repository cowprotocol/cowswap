import { useAtom } from 'jotai'

import { wrapNativeStateAtom } from '../state/wrapNativeStateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useWrapNativeScreenState() {
  return useAtom(wrapNativeStateAtom)
}
