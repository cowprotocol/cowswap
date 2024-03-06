import { useMemo } from 'react'

import { ParsedAmounts } from 'legacy/hooks/usePriceImpact/types'
import { Field } from 'legacy/state/types'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { useSwapState } from './useSwapState'
import { useDerivedSwapInfo } from './useSwapState'

export function useSwapCurrenciesAmounts(): ParsedAmounts {
  const { independentField } = useSwapState()
  const { trade, parsedAmount } = useDerivedSwapInfo()

  const isInputIndependent = independentField === Field.INPUT
  const inputAmountWithoutFee = trade?.inputAmountWithoutFee
  const outputAmountWithoutFee = trade?.outputAmountWithoutFee

  const context = useSafeMemoObject({
    parsedAmount,
    inputAmountWithoutFee,
    outputAmountWithoutFee,
  })

  return useMemo(() => {
    const { parsedAmount, inputAmountWithoutFee, outputAmountWithoutFee } = context
    return {
      [Field.INPUT]: isInputIndependent ? parsedAmount : inputAmountWithoutFee,
      [Field.OUTPUT]: isInputIndependent ? outputAmountWithoutFee : parsedAmount,
    }
  }, [isInputIndependent, context])
}
