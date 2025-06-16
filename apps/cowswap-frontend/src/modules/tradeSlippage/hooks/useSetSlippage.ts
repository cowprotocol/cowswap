import { useSetAtom } from 'jotai'

import { setUserSlippageAtom } from '../state/slippageValueAndTypeAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSetSlippage() {
  return useSetAtom(setUserSlippageAtom)
}
