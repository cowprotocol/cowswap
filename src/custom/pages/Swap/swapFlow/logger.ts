import { SwapFlowContext } from 'pages/Swap/swapFlow/types'

export function logSwapFlow(...args: any[]) {
  console.debug('%c [SWAP FLOW] ', 'font-weight: bold; color: #1c5dbf', args)
}

export function logSwapFlowError(...args: any[]) {
  console.debug('%c [SWAP FLOW ERROR] ', 'font-weight: bold; color: #1c5dbf', args)
}

export function traceTrading(input: SwapFlowContext) {
  const { executionPrice, inputAmountWithFee, fee, outputAmount: expectedOutputAmount, tradeType } = input.context.trade

  console.trace(
    `%c [SWAP FLOW] >> Trading ${tradeType}
      1. Original Input = ${input.context.inputAmountWithSlippage.toExact()}
      2. Fee = ${fee?.feeAsCurrency?.toExact() || '0'}
      3. Input Adjusted for Fee = ${inputAmountWithFee.toExact()}
      4. Expected Output = ${expectedOutputAmount.toExact()}
      4b. Output with SLIPPAGE = ${input.context.outputAmountWithSlippage.toExact()}
      5. Price = ${executionPrice.toFixed()}
      6. Details: `,
    input,
    'color: #1c5dbf'
  )
}
