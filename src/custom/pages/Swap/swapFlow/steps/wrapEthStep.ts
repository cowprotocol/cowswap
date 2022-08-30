import { formatSmart } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { Weth } from '@src/abis/types'
import { TransactionAdder } from 'state/enhancedTransactions/hooks'
import { logSwapFlow, logSwapFlowError } from 'pages/Swap/swapFlow/logger'

export interface WrapEthInput {
  amount: CurrencyAmount<Currency>
  weth: Weth
  transactionAdder: TransactionAdder
}

export async function wrapEthStep(input: WrapEthInput) {
  const { amount, weth, transactionAdder } = input
  logSwapFlow('Wrapping ETH!', amount.quotient.toString(), weth)

  try {
    const txReceipt = await weth.deposit({ value: `0x${amount.quotient.toString(16)}` })
    transactionAdder({
      hash: txReceipt.hash,
      summary: `Wrap ${formatSmart(amount, AMOUNT_PRECISION)} ETH to WETH`,
    })
    logSwapFlow('Wrapped!', amount)
    return txReceipt
  } catch (error) {
    logSwapFlowError('Could not WRAP', error)
    return 'Failed to wrap'
  }
}
