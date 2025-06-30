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
  const { defaultValue, isSmartSlippageDisabled } = useAtomValue(slippageConfigAtom)
  const smartSlippage = useSmartSlippageFromQuote()

  const isSmartSlippageEnabledByWidget = useAtomValue(shouldUseAutoSlippageAtom)
  const isSmartSlippageEnabled = isSmartSlippageEnabledByWidget && !isSmartSlippageDisabled

  return useMemo(() => {
    if (typeof currentUserSlippage === 'number') {
      return { type: 'user', value: currentUserSlippage }
    }

    if (isSmartSlippageEnabled && smartSlippage && smartSlippage !== defaultValue) {
      return { type: 'smart', value: smartSlippage }
    }

    return { type: 'default', value: defaultValue }
  }, [currentUserSlippage, defaultValue, smartSlippage, isSmartSlippageEnabled])
}

export function useTradeSlippage(): Percent {
  const { value } = useTradeSlippageValueAndType()

  return useMemo(() => bpsToPercent(value), [value])
}

export function useDefaultTradeSlippage(): Percent {
  return bpsToPercent(useAtomValue(slippageConfigAtom).defaultValue)
}
