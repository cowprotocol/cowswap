import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { WrapType } from 'hooks/useWrapCallback'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { ParsedAmounts } from 'hooks/usePriceImpact/types'

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
