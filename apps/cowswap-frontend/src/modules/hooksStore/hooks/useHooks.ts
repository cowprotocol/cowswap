import { useAtomValue } from 'jotai'

import { hooksAtom } from '../state/hookDetailsAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useHooks() {
  return useAtomValue(hooksAtom)
}
