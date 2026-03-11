import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export function getFeeToken(order: ParsedOrder): Token | undefined {
  const { inputToken, outputToken } = order
  const { executedFeeToken } = order.executionData

  const feeTokenAddress = executedFeeToken ? getAddressKey(executedFeeToken) : undefined

  if (!feeTokenAddress) {
    return inputToken
  }

  return [inputToken, outputToken].find((token) => token && areAddressesEqual(token.address, feeTokenAddress))
}
