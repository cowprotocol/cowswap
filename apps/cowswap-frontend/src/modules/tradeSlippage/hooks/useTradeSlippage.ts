import { useAtomValue } from 'jotai/index'
import { useMemo } from 'react'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import {
  defaultSlippageAtom,
  slippageValueAndTypeAtom,
  smartTradeSlippageAtom,
} from '../state/slippageValueAndTypeAtom'

export function useTradeSlippageValueAndType() {
  return useAtomValue(slippageValueAndTypeAtom)
}
export function useTradeSlippage(): Percent {
  const { value } = useTradeSlippageValueAndType()

  return useMemo(() => bpsToPercent(value), [value])
}

export function useDefaultTradeSlippage() {
  return bpsToPercent(useAtomValue(defaultSlippageAtom))
}

export function useSmartTradeSlippage() {
  return useAtomValue(smartTradeSlippageAtom)
}
