import { useTradeSlippageValueAndType } from './useTradeSlippage'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useIsSlippageModified() {
  return useTradeSlippageValueAndType().type === 'user'
}
