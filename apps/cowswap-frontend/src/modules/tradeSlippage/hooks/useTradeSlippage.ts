import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import {
  defaultSlippageAtom,
  SlippageType,
  slippageValueAndTypeAtom,
  smartTradeSlippageAtom,
} from '../state/slippageValueAndTypeAtom'

export function useTradeSlippageValueAndType(): { type: SlippageType; value: number } {
  return useAtomValue(slippageValueAndTypeAtom)
}
export function useTradeSlippage(): Percent {
  const { value } = useTradeSlippageValueAndType()

  return useMemo(() => bpsToPercent(value), [value])
}

export function useDefaultTradeSlippage(): Percent {
  return bpsToPercent(useAtomValue(defaultSlippageAtom))
}

export function useSmartTradeSlippage(): number | null {
  return useAtomValue(smartTradeSlippageAtom)
}
