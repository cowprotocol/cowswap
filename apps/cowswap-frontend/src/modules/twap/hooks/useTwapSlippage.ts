import { useAtomValue } from 'jotai'

import { twapOrderSlippageAtom } from '../state/twapOrdersSettingsAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useTwapSlippage() {
  return useAtomValue(twapOrderSlippageAtom)
}
