import { useMemo } from 'react'

import { ParsedAmounts } from 'legacy/hooks/usePriceImpact/types'
import { Field } from 'legacy/state/swap/actions'
import { useSwapState } from 'legacy/state/swap/hooks'
import { useDerivedSwapInfo } from 'legacy/state/swap/hooks'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

export function useSwapCurrenciesAmounts(): ParsedAmounts {
  const { independentField } = useSwapState()
  const { v2Trade: trade, parsedAmount } = useDerivedSwapInfo()

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
