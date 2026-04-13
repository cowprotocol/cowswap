import { getRpcProvider } from '@cowprotocol/common-const'
import { calculateGasMargin, delay } from '@cowprotocol/common-utils'
import { GPv2Settlement } from '@cowprotocol/cowswap-abis'
import { BigNumber } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'

import { logTradeFlow, logTradeFlowError } from 'modules/trade/utils/logger'

import { GAS_LIMIT_DEFAULT, MAX_WALLET_RETRIES, RETRY_BASE_DELAY_MS } from 'common/constants/common'

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

async function estimatePresignGas(orderId: string, settlementContract: GPv2Settlement): Promise<BigNumber> {
  for (let attempt = 1; attempt <= MAX_WALLET_RETRIES; attempt++) {
    try {
      return await settlementContract.estimateGas.setPreSignature(orderId, true)
    } catch (error) {
      logTradeFlowError('SWAP FLOW', `Wallet estimateGas attempt ${attempt}/${MAX_WALLET_RETRIES} failed`, error)
      if (attempt < MAX_WALLET_RETRIES) {
        await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
      }
    }
  }

  logTradeFlow('SWAP FLOW', 'Wallet retries exhausted, switching to fallback provider')
  const { chainId } = await settlementContract.provider.getNetwork()
  const fallbackProvider = getRpcProvider(chainId)
  if (fallbackProvider) {
    try {
      const signerAddress = settlementContract.signer ? await settlementContract.signer.getAddress() : undefined
      const fallbackContract = settlementContract.connect(fallbackProvider) as GPv2Settlement
      return await fallbackContract.estimateGas.setPreSignature(orderId, true, {
        ...(signerAddress ? { from: signerAddress } : {}),
      })
    } catch (error) {
      logTradeFlowError('SWAP FLOW', 'Fallback RPC for setPreSignature failed', error)
    }
  }

  logTradeFlowError('SWAP FLOW', `All estimateGas attempts failed, using default ${GAS_LIMIT_DEFAULT}`)
  return GAS_LIMIT_DEFAULT
}
