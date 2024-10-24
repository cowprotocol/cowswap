import { useAtomValue } from 'jotai/index'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import {
  defaultSlippageAtom,
  smartTradeSlippageAtom,
  tradeSlippagePercentAtom,
} from '../state/slippageValueAndTypeAtom'

export function useTradeSlippage(): Percent {
  return useAtomValue(tradeSlippagePercentAtom)
}

export function useDefaultTradeSlippage() {
  return bpsToPercent(useAtomValue(defaultSlippageAtom))
}

export function useSmartTradeSlippage() {
  return useAtomValue(smartTradeSlippageAtom)
}
