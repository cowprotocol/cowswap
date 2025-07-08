import { useAtomValue } from 'jotai'

import { useDebounce } from '@cowprotocol/common-hooks'

import { tradeFormValidationAtom } from '../state/tradeFormValidationAtom'
import { TradeFormValidation } from '../types'

const TRADE_FORM_VALIDATION_DEBOUNCE = 200

export function useGetTradeFormValidations(): TradeFormValidation[] | null {
  const validations = useAtomValue(tradeFormValidationAtom)

  return useDebounce(validations, TRADE_FORM_VALIDATION_DEBOUNCE)
}
