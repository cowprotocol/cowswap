import { useAtomValue } from 'jotai'

import { useDebounce } from '@cowprotocol/common-hooks'

import { tradeFormValidationAtom } from '../state/tradeFormValidationAtom'
import { TradeFormValidation } from '../types'

const TRADE_FORM_VALIDATION_DEBOUNCE = 200

export function useGetTradeFormValidation(): TradeFormValidation | null {
  const validation = useAtomValue(tradeFormValidationAtom)

  // Just in case, to avoid blinking of the trade form button
  return useDebounce(validation, TRADE_FORM_VALIDATION_DEBOUNCE)
}
