/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { calculateGasMargin } from '@cowprotocol/common-utils'

import { encodeFunctionData, type Hex } from 'viem'
import { estimateGas, writeContract } from 'wagmi/actions'

import { Order } from 'legacy/state/orders/actions'

import { logTradeFlowError } from 'modules/trade/utils/logger'

import type { EthFlowContractData, SettlementContractData } from '../useContract'
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

export async function getEthFlowCancellation({
  config,
  ethFlowContract,
  order,
}: {
  config: Config
  ethFlowContract: EthFlowContractData
  order: Order
}): Promise<OnChainCancellation> {
  const cancelOrderParams = [
    {
      buyToken: order.buyToken as `0x${string}`,
      receiver: (order.receiver || order.owner) as `0x${string}`,
      sellAmount: BigInt(order.sellAmount),
      buyAmount: BigInt(order.buyAmount),
      appData: order.appData.toString() as Hex,
      feeAmount: BigInt(order.feeAmount),
      validTo: order.validTo,
      partiallyFillable: false,
      quoteId: 0n,
    },
  ] as const

  const estimatedGas = await estimateGas(config, {
    to: ethFlowContract.address as `0x${string}`,
    data: encodeFunctionData({
      abi: ethFlowContract.abi,
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
    estimatedGas: estimatedGas,
    sendTransaction: (processCancelledOrder) => {
      return writeContract(config, {
        abi: ethFlowContract.abi,
        address: ethFlowContract.address as `0x${string}`,
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

export async function getOnChainCancellation({
  config,
  order,
  settlementContract,
}: {
  config: Config
  order: Order
  settlementContract: SettlementContractData
}): Promise<OnChainCancellation> {
  const cancelOrderParams = [order.id as Hex] as const

  const estimatedGas = await estimateGas(config, {
    to: settlementContract.address as `0x${string}`,
    data: encodeFunctionData({
      abi: settlementContract.abi,
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
        abi: settlementContract.abi,
        address: settlementContract.address as `0x${string}`,
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
