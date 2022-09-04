import { Field } from '@src/state/swap/actions'
import { formatSmartAmount } from 'utils/format'
import { useSwapState } from '@src/state/swap/hooks'
import { useWrapType, WrapType } from 'hooks/useWrapCallback'
import { useDerivedSwapInfo } from 'state/swap/hooks'

export interface SwapCurrenciesViewAmounts {
  [Field.INPUT]: string
  [Field.OUTPUT]: string
}

export function useSwapCurrenciesViewAmounts(): SwapCurrenciesViewAmounts {
  const { independentField, typedValue } = useSwapState()
  const wrapType = useWrapType()
  const { v2Trade: trade, parsedAmount } = useDerivedSwapInfo()

  const isInputIndependent = independentField === Field.INPUT
  const isWrapUnwrapMode = wrapType !== WrapType.NOT_APPLICABLE

  if (isWrapUnwrapMode) {
    const parsedAmountExact = parsedAmount?.toExact() ?? ''

    return {
      [Field.INPUT]: isInputIndependent ? typedValue : parsedAmountExact,
      [Field.OUTPUT]: isInputIndependent ? parsedAmountExact : typedValue,
    }
  }

  return {
    [Field.INPUT]: isInputIndependent ? typedValue : formatSmartAmount(trade?.inputAmountWithoutFee) ?? '',
    [Field.OUTPUT]: isInputIndependent ? formatSmartAmount(trade?.outputAmountWithoutFee) ?? '' : typedValue,
  }
}
