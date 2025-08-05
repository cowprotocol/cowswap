import { useGetTradeFormValidations } from './useGetTradeFormValidations'

import { TradeFormValidation } from '../types'

export function useGetTradeFormValidation(): TradeFormValidation | null {
  const validations = useGetTradeFormValidations()

  return validations ? validations[0] : null
}
