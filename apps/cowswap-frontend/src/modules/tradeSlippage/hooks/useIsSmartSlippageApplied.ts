import { useTradeSlippageValueAndType } from './useTradeSlippage'

export function useIsSmartSlippageApplied(): boolean {
  return useTradeSlippageValueAndType().type === 'smart'
}
