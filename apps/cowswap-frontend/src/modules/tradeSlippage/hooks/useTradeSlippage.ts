import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import {
  defaultSlippageAtom,
  slippageValueAndTypeAtom,
  smartTradeSlippageAtom,
} from '../state/slippageValueAndTypeAtom'

export function useTradeSlippage(): Percent {
  const { value } = useAtomValue(slippageValueAndTypeAtom)

  return useMemo(() => bpsToPercent(value), [value])
}

export function useDefaultTradeSlippage() {
  return bpsToPercent(useAtomValue(defaultSlippageAtom))
}

export function useSmartTradeSlippage() {
  return useAtomValue(smartTradeSlippageAtom)
}
