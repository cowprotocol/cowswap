/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { calculateGasMargin } from '@cowprotocol/common-utils'
import { CoWSwapEthFlow } from '@cowprotocol/cowswap-abis'

import { estimateGas, writeContract } from '@wagmi/core'
import { encodeFunctionData, type Hex } from 'viem'

import { Order } from 'legacy/state/orders/actions'

import { logTradeFlowError } from 'modules/trade/utils/logger'

import type { SettlementContractData } from '../useContract'
import type { Config } from 'wagmi'

// Fallback If we couldn't estimate gas for on-chain cancellation
const CANCELLATION_GAS_LIMIT_DEFAULT = 150000n
const LOG_LABEL = 'CANCEL ETH FLOW ORDER'

export type CancelledOrderInfo = {
  txHash: string
  orderId: string
  sellTokenAddress: string
  sellTokenSymbol?: string
}

export interface OnChainCancellation {
  estimatedGas: bigint

  sendTransaction(processCancelledOrder: (cancelledOrderInfo: CancelledOrderInfo) => void): Promise<void>
}

export async function getEthFlowCancellation(
  ethFlowContract: CoWSwapEthFlow,
  order: Order,
): Promise<OnChainCancellation> {
  const cancelOrderParams = {
    buyToken: order.buyToken,
    receiver: order.receiver || order.owner,
    sellAmount: order.sellAmount,
    buyAmount: order.buyAmount,
    appData: order.appData.toString(),
    feeAmount: order.feeAmount,
    validTo: order.validTo.toString(),
    partiallyFillable: false,
    quoteId: 0, // value doesn't matter, set to 0 for reducing gas costs
  }

  const estimatedGas = await ethFlowContract.estimateGas.invalidateOrder(cancelOrderParams).catch((error: Error) => {
    logTradeFlowError(
      LOG_LABEL,
      `Error estimating invalidateOrder gas. Using default ${CANCELLATION_GAS_LIMIT_DEFAULT}`,
      error,
    )
    return CANCELLATION_GAS_LIMIT_DEFAULT
  })

  return {
    estimatedGas: typeof estimatedGas === 'bigint' ? estimatedGas : estimatedGas.toBigInt(),
    sendTransaction: (processCancelledOrder) => {
      return ethFlowContract
        .invalidateOrder(cancelOrderParams, { gasLimit: calculateGasMargin(estimatedGas) })
        .then((res) => {
          processCancelledOrder({
            txHash: res.hash,
            orderId: order.id,
            sellTokenAddress: order.inputToken.address,
            sellTokenSymbol: order.inputToken.symbol,
          })
        })
    },
  }
}

export async function getOnChainCancellation({
  config,
  order,
  settlementContractData,
}: {
  config: Config
  order: Order
  settlementContractData: SettlementContractData
}): Promise<OnChainCancellation> {
  const cancelOrderParams = [order.id as Hex] as const

  const estimatedGas = await estimateGas(config, {
    to: settlementContractData.address,
    data: encodeFunctionData({
      abi: settlementContractData.abi,
      functionName: 'invalidateOrder',
      args: cancelOrderParams,
    }),
  }).catch((error: Error) => {
    logTradeFlowError(
      LOG_LABEL,
      `Error estimating invalidateOrder gas. Using default ${CANCELLATION_GAS_LIMIT_DEFAULT}`,
      error,
    )
    return CANCELLATION_GAS_LIMIT_DEFAULT
  })

  return {
    estimatedGas,
    sendTransaction: (processCancelledOrder) => {
      return writeContract(config, {
        abi: settlementContractData.abi,
        address: settlementContractData.address,
        functionName: 'invalidateOrder',
        args: cancelOrderParams,
        gas: calculateGasMargin(estimatedGas),
      }).then((hash) => {
        processCancelledOrder({
          txHash: hash,
          orderId: order.id,
          sellTokenAddress: order.inputToken.address,
          sellTokenSymbol: order.inputToken.symbol,
        })
      })
    },
  }
}
