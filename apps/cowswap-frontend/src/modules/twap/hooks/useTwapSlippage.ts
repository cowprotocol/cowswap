import { useAtomValue } from 'jotai/index'

import { twapOrderSlippageAtom } from '../state/twapOrdersSettingsAtom'

export function useTwapSlippage() {
  return useAtomValue(twapOrderSlippageAtom)
}
