import { useAtomValue } from 'jotai/index'

import { Percent } from '@uniswap/sdk-core'

import { swapSlippagePercentAtom } from '../state/swapSlippageAtom'

export function useSwapSlippage(): Percent {
  return useAtomValue(swapSlippagePercentAtom)
}
