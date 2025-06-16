import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import { useSmartSlippageFromQuote } from 'modules/tradeQuote'

import {
  defaultSlippageAtom,
  SlippageType,
  currentUserSlippageAtom,
  shouldUseAutoSlippageAtom,
} from '../state/slippageValueAndTypeAtom'


export function useTradeSlippageValueAndType(): { type: SlippageType; value: number } {
  const currentUserSlippage = useAtomValue(currentUserSlippageAtom)
  const defaultSlippage = useAtomValue(defaultSlippageAtom)
  const smartSlippage = useSmartSlippageFromQuote()
  const isSmartSlippageEnabledByWidget = useAtomValue(shouldUseAutoSlippageAtom)

  return useMemo(() => {
    if (typeof currentUserSlippage === 'number') {
      return { type: 'user', value: currentUserSlippage }
    }

    if (isSmartSlippageEnabledByWidget && smartSlippage && smartSlippage !== defaultSlippage) {
      return { type: 'smart', value: smartSlippage }
    }

    return { type: 'default', value: defaultSlippage }
  }, [currentUserSlippage, defaultSlippage, smartSlippage, isSmartSlippageEnabledByWidget])
}
export function useTradeSlippage(): Percent {
  const { value } = useTradeSlippageValueAndType()

  return useMemo(() => bpsToPercent(value), [value])
}

export function useDefaultTradeSlippage(): Percent {
  return bpsToPercent(useAtomValue(defaultSlippageAtom))
}
