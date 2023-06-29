import { ParsedAmounts } from 'legacy/hooks/usePriceImpact/types'
import { WrapType } from 'legacy/hooks/useWrapCallback'
import { Field } from 'legacy/state/swap/actions'
import { useSwapState } from 'legacy/state/swap/hooks'
import { useDerivedSwapInfo } from 'legacy/state/swap/hooks'

export function useSwapCurrenciesAmounts(wrapType: WrapType): ParsedAmounts {
  const { independentField } = useSwapState()
  const { v2Trade: trade, parsedAmount } = useDerivedSwapInfo()

  const isInputIndependent = independentField === Field.INPUT
  const isWrapUnwrapMode = wrapType !== WrapType.NOT_APPLICABLE

  if (isWrapUnwrapMode) {
    return {
      [Field.INPUT]: parsedAmount,
      [Field.OUTPUT]: parsedAmount,
    }
  }

  return {
    [Field.INPUT]: isInputIndependent ? parsedAmount : trade?.inputAmountWithoutFee,
    [Field.OUTPUT]: isInputIndependent ? trade?.outputAmountWithoutFee : parsedAmount,
  }
}
