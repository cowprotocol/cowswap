import { GPv2Settlement, CoWSwapEthFlow } from '@cowprotocol/abis'
import { calculateGasMargin } from '@cowprotocol/common-utils'
import { BigNumber } from '@ethersproject/bignumber'

import { Order } from 'legacy/state/orders/actions'

import { logTradeFlowError } from 'modules/trade/utils/logger'

// Fallback If we couldn't estimate gas for on-chain cancellation
const CANCELLATION_GAS_LIMIT_DEFAULT = BigNumber.from(150000)
const LOG_LABEL = 'CANCEL ETH FLOW ORDER'

export type CancelledOrderInfo = {
  txHash: string
  orderId: string
  sellTokenAddress: string
  sellTokenSymbol?: string
}

export interface OnChainCancellation {
  estimatedGas: BigNumber

  sendTransaction(processCancelledOrder: (cancelledOrderInfo: CancelledOrderInfo) => void): Promise<void>
}

export async function getEthFlowCancellation(
  ethFlowContract: CoWSwapEthFlow,
  order: Order
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
      error
    )
    return CANCELLATION_GAS_LIMIT_DEFAULT
  })

  return {
    estimatedGas,
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

export async function getOnChainCancellation(contract: GPv2Settlement, order: Order): Promise<OnChainCancellation> {
  const cancelOrderParams = order.id

  const estimatedGas = await contract.estimateGas.invalidateOrder(cancelOrderParams).catch((error: Error) => {
    logTradeFlowError(
      LOG_LABEL,
      `Error estimating invalidateOrder gas. Using default ${CANCELLATION_GAS_LIMIT_DEFAULT}`,
      error
    )
    return CANCELLATION_GAS_LIMIT_DEFAULT
  })

  return {
    estimatedGas,
    sendTransaction: (processCancelledOrder) => {
      return contract.invalidateOrder(cancelOrderParams, { gasLimit: calculateGasMargin(estimatedGas) }).then((res) => {
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
