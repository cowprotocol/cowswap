import { NATIVE_CURRENCY_ADDRESS } from '@cowprotocol/common-const'

export function getIsEthFlowOrder(inputTokenAddress: string): boolean {
  return inputTokenAddress === NATIVE_CURRENCY_ADDRESS
}
