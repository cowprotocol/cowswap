import { useGasPaymentReason } from './useGasPaymentReason'

export function useShouldPayGas(): boolean {
  return useGasPaymentReason() !== null
}
