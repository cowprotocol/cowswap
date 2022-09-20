import { calculateGasMargin } from '@uni_src/utils/calculateGasMargin'
import { GPv2Settlement } from 'abis/types'
import { BigNumber } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'
import { logSwapFlow, logSwapFlowError } from 'pages/Swap/swapFlow/logger'

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const PRESIGN_GAS_LIMIT_DEFAULT = BigNumber.from('150000')

export async function presignOrderStep(
  orderId: string,
  settlementContract: GPv2Settlement
): Promise<ContractTransaction | null> {
  logSwapFlow('Pre-signing order', orderId)

  const estimatedGas = await settlementContract.estimateGas.setPreSignature(orderId, true).catch((error) => {
    logSwapFlowError('Error estimating setPreSignature gas. Using default ' + PRESIGN_GAS_LIMIT_DEFAULT, error)
    return PRESIGN_GAS_LIMIT_DEFAULT
  })

  const txReceipt = await settlementContract.setPreSignature(orderId, true, {
    gasLimit: calculateGasMargin(estimatedGas),
  })

  logSwapFlow('Sent transaction for presigning', orderId, txReceipt)

  return txReceipt
}
