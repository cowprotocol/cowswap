import { useAtomValue } from 'jotai/index'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import { defaultSlippageAtom, smartSwapSlippageAtom, swapSlippagePercentAtom } from '../state/slippageValueAndTypeAtom'

export function useSwapSlippage(): Percent {
  return useAtomValue(swapSlippagePercentAtom)
}

export function useDefaultSwapSlippage() {
  return bpsToPercent(useAtomValue(defaultSlippageAtom))
}

export function useSmartSwapSlippage() {
  return useAtomValue(smartSwapSlippageAtom)
}
