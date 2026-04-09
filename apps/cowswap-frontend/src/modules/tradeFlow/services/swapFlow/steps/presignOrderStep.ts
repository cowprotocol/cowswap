import { getRpcProvider } from '@cowprotocol/common-const'
import { calculateGasMargin } from '@cowprotocol/common-utils'
import { GPv2Settlement } from '@cowprotocol/cowswap-abis'
import { BigNumber } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'

import { logTradeFlow, logTradeFlowError } from 'modules/trade/utils/logger'

import { GAS_LIMIT_DEFAULT, MAX_WALLET_RETRIES } from 'common/constants/common'

export async function presignOrderStep(
  orderId: string,
  settlementContract: GPv2Settlement,
): Promise<ContractTransaction | null> {
  logTradeFlow('SWAP FLOW', 'Pre-signing order', orderId)

  const estimatedGas = await estimatePresignGas(orderId, settlementContract)

  const txReceipt = await settlementContract.setPreSignature(orderId, true, {
    gasLimit: calculateGasMargin(estimatedGas),
  })

  logTradeFlow('SWAP FLOW', 'Sent transaction for presigning', orderId, txReceipt)

  return txReceipt
}

let presignWalletFailCount = 0

async function estimatePresignGas(orderId: string, settlementContract: GPv2Settlement): Promise<BigNumber> {
  if (presignWalletFailCount < MAX_WALLET_RETRIES) {
    try {
      const result = await settlementContract.estimateGas.setPreSignature(orderId, true)
      presignWalletFailCount = 0
      return result
    } catch (error) {
      presignWalletFailCount++
      logTradeFlowError(
        'SWAP FLOW',
        `Wallet estimateGas failed (${presignWalletFailCount}/${MAX_WALLET_RETRIES})`,
        error,
      )
    }
  }

  const { chainId } = await settlementContract.provider.getNetwork()
  const fallbackProvider = getRpcProvider(chainId)
  if (fallbackProvider) {
    try {
      const fallbackContract = settlementContract.connect(fallbackProvider) as GPv2Settlement
      return await fallbackContract.estimateGas.setPreSignature(orderId, true)
    } catch (error) {
      logTradeFlowError('SWAP FLOW', 'Fallback RPC for setPreSignature failed', error)
    }
  }

  logTradeFlowError('SWAP FLOW', `All estimateGas attempts failed, using default ${GAS_LIMIT_DEFAULT}`)
  return GAS_LIMIT_DEFAULT
}
