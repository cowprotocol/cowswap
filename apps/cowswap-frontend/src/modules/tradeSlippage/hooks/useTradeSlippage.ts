import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import { useSmartSlippageFromQuote } from 'modules/tradeQuote'

import {
  SlippageType,
  currentUserSlippageAtom,
  shouldUseAutoSlippageAtom,
  slippageConfigAtom,
} from '../state/slippageValueAndTypeAtom'

export function useTradeSlippageValueAndType(): { type: SlippageType; value: number } {
  const currentUserSlippage = useAtomValue(currentUserSlippageAtom)
  const { defaultValue, max } = useAtomValue(slippageConfigAtom)
  const smartSlippageFromQuote = useSmartSlippageFromQuote()

  const shouldUseAutoSlippage = useAtomValue(shouldUseAutoSlippageAtom)

  return useMemo(() => {
    if (typeof currentUserSlippage === 'number') {
      return { type: 'user', value: currentUserSlippage }
    }

    if (shouldUseAutoSlippage && smartSlippageFromQuote && smartSlippageFromQuote > 0) {
      return { type: 'smart', value: Math.min(smartSlippageFromQuote, max) }
    }

    return { type: 'default', value: defaultValue }
  }, [currentUserSlippage, defaultValue, smartSlippageFromQuote, shouldUseAutoSlippage, max])
}

export function useTradeSlippage(): Percent {
  const { value } = useTradeSlippageValueAndType()

  return useMemo(() => bpsToPercent(value), [value])
}

export function useDefaultTradeSlippage(): Percent {
  return bpsToPercent(useAtomValue(slippageConfigAtom).defaultValue)
}
