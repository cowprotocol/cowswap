import { ParsedOrder } from 'utils/orderUtils/parseOrder'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getFeeToken(order: ParsedOrder) {
  const { inputToken, outputToken } = order
  const { executedFeeToken } = order.executionData

  const feeTokenAddress = executedFeeToken?.toLowerCase()

  if (!feeTokenAddress) {
    return inputToken
  }

  return [inputToken, outputToken].find((token) => token?.address.toLowerCase() === feeTokenAddress)
}
