import { useTradeSlippageValueAndType } from './useTradeSlippage'

export function useIsDefaultSlippageApplied(): boolean {
  return useTradeSlippageValueAndType().type === 'default'
}
