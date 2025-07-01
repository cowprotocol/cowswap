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
  const { defaultValue, disableAutoSlippage } = useAtomValue(slippageConfigAtom)
  const smartSlippage = useSmartSlippageFromQuote()

  const isSmartSlippageEnabledByWidget = useAtomValue(shouldUseAutoSlippageAtom)
  const isSmartSlippageEnabled = isSmartSlippageEnabledByWidget && !disableAutoSlippage

  return useMemo(() => {
    if (typeof currentUserSlippage === 'number') {
      return { type: 'user', value: currentUserSlippage }
    }

    // default slippage is always equal to min slippage value by default
    // in case if integrator wants to set up the default value higher than min slippage value
    // we should use the default value from the config
    if (isSmartSlippageEnabled && smartSlippage && smartSlippage > defaultValue) {
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
