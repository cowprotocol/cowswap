import { useTradeSlippageValueAndType } from './useTradeSlippage'

export function useIsSlippageModified(): boolean {
  return useTradeSlippageValueAndType().type === 'user'
}
