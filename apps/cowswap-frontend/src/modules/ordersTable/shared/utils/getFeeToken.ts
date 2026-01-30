import { Token } from '@uniswap/sdk-core'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export function getFeeToken(order: ParsedOrder): Token | undefined {
  const { inputToken, outputToken } = order
  const { executedFeeToken } = order.executionData

  const feeTokenAddress = executedFeeToken?.toLowerCase()

  if (!feeTokenAddress) {
    return inputToken
  }

  return [inputToken, outputToken].find((token) => token?.address.toLowerCase() === feeTokenAddress)
}
