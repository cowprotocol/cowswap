import { GPv2Settlement } from '@cowprotocol/abis'
import { calculateGasMargin } from '@cowprotocol/common-utils'
import { ContractTransaction } from '@ethersproject/contracts'

import { logTradeFlow, logTradeFlowError } from 'modules/trade/utils/logger'

import { GAS_LIMIT_DEFAULT } from 'common/constants/common'

export async function presignOrderStep(
  orderId: string,
  settlementContract: GPv2Settlement
): Promise<ContractTransaction | null> {
  logTradeFlow('SWAP FLOW', 'Pre-signing order', orderId)

  const estimatedGas = await settlementContract.estimateGas.setPreSignature(orderId, true).catch((error) => {
    logTradeFlowError('SWAP FLOW', 'Error estimating setPreSignature gas. Using default ' + GAS_LIMIT_DEFAULT, error)
    return GAS_LIMIT_DEFAULT
  })

  const txReceipt = await settlementContract.setPreSignature(orderId, true, {
    gasLimit: calculateGasMargin(estimatedGas),
  })

  logTradeFlow('SWAP FLOW', 'Sent transaction for presigning', orderId, txReceipt)

  return txReceipt
}
