import { useAtomValue } from 'jotai'

import { slippageValueAndTypeAtom } from '../state/slippageValueAndTypeAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useIsSmartSlippageApplied() {
  return useAtomValue(slippageValueAndTypeAtom).type === 'smart'
}
