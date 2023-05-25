import { CoWSwapEthFlow } from 'abis/types/ethflow'
import { Order } from 'legacy/state/orders/actions'
import { logTradeFlowError } from 'modules/trade/utils/logger'
import { ETHFLOW_GAS_LIMIT_DEFAULT } from 'modules/swap/services/ethFlow/const'
import { calculateGasMargin } from 'legacy/utils/calculateGasMargin'
import { GPv2Settlement } from 'abis/types'
import { BigNumber } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'

const LOG_LABEL = 'CANCEL ETH FLOW ORDER'

export interface OnChainCancellation {
  estimatedGas: BigNumber

  sendTransaction(): Promise<ContractTransaction>
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
    logTradeFlowError(LOG_LABEL, `Error estimating createOrder gas. Using default ${ETHFLOW_GAS_LIMIT_DEFAULT}`, error)
    return ETHFLOW_GAS_LIMIT_DEFAULT
  })

  return {
    estimatedGas,
    sendTransaction: () => {
      return ethFlowContract.invalidateOrder(cancelOrderParams, { gasLimit: calculateGasMargin(estimatedGas) })
    },
  }
}

export async function getOnChainCancellation(contract: GPv2Settlement, order: Order): Promise<OnChainCancellation> {
  const cancelOrderParams = order.id

  const estimatedGas = await contract.estimateGas.invalidateOrder(cancelOrderParams).catch((error: Error) => {
    logTradeFlowError(LOG_LABEL, `Error estimating createOrder gas. Using default ${ETHFLOW_GAS_LIMIT_DEFAULT}`, error)
    return ETHFLOW_GAS_LIMIT_DEFAULT
  })

  return {
    estimatedGas,
    sendTransaction: () => {
      return contract.invalidateOrder(cancelOrderParams, { gasLimit: calculateGasMargin(estimatedGas) })
    },
  }
}
