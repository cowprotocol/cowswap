import { useAtomValue } from 'jotai'

import { twapOrderSlippageAtom } from '../state/twapOrdersSettingsAtom'

export function useTwapSlippage() {
  return useAtomValue(twapOrderSlippageAtom)
}
