import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import {
  defaultSlippageAtom,
  slippageValueAndTypeAtom,
  smartTradeSlippageAtom,
} from '../state/slippageValueAndTypeAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useTradeSlippageValueAndType() {
  return useAtomValue(slippageValueAndTypeAtom)
}
export function useTradeSlippage(): Percent {
  const { value } = useTradeSlippageValueAndType()

  return useMemo(() => bpsToPercent(value), [value])
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDefaultTradeSlippage() {
  return bpsToPercent(useAtomValue(defaultSlippageAtom))
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSmartTradeSlippage() {
  return useAtomValue(smartTradeSlippageAtom)
}
