import { useAtomValue } from 'jotai'

import useDebounce from 'legacy/hooks/useDebounce'

import { tradeFormValidationAtom } from '../state/tradeFormValidationAtom'
import { TradeFormValidation } from '../types'

const TRADE_FORM_VALIDATION_DEBOUNCE = 200

export function useGetTradeFormValidation(): TradeFormValidation | null {
  const validation = useAtomValue(tradeFormValidationAtom)

  return useDebounce(validation, TRADE_FORM_VALIDATION_DEBOUNCE)
}
