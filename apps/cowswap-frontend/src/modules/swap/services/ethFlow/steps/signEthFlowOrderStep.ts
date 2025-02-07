import { CoWSwapEthFlow } from '@cowprotocol/abis'
import { calculateGasMargin, getRawCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { OrderClass, SigningScheme, UnsignedOrder } from '@cowprotocol/cow-sdk'
import { ContractTransaction } from '@ethersproject/contracts'

import { Order } from 'legacy/state/orders/actions'
import { getSignOrderParams, mapUnsignedOrderToOrder, PostOrderParams } from 'legacy/utils/trade'

import { logTradeFlow, logTradeFlowError } from 'modules/trade/utils/logger'
import { TradeFlowContext } from 'modules/tradeFlow'

import { GAS_LIMIT_DEFAULT } from 'common/constants/common'
import { logEthSendingIntention, logEthSendingTransaction } from 'common/services/logEthSendingTransaction'
import { assertProviderNetwork } from 'common/utils/assertProviderNetwork'

type EthFlowCreateOrderParams = Omit<UnsignedOrder, 'quoteId' | 'appData' | 'validTo' | 'orderId'> & {
  quoteId: number
  appData: string
  validTo: string
  summary: string
}

type EthFlowResponse = {
  txReceipt: ContractTransaction
  order: Order
}

export async function signEthFlowOrderStep(
  orderId: string,
  orderParams: PostOrderParams,
  ethFlowContract: CoWSwapEthFlow,
  addInFlightOrderId: (orderId: string) => void,
  tradeFlowContext: TradeFlowContext,
): Promise<EthFlowResponse> {
  logTradeFlow('ETH FLOW', '[EthFlow::SignEthFlowOrderStep] - signing orderParams onchain', orderParams)

  const etherValue = orderParams.sellAmountBeforeFee
  const { order, quoteId, summary } = getSignOrderParams(orderParams)

  if (!quoteId) {
    throw new Error('[EthFlow::SignEthFlowOrderStep] No quoteId passed')
  }

  const network = await assertProviderNetwork(orderParams.chainId, ethFlowContract.provider, 'eth-flow')

  const ethOrderParams: EthFlowCreateOrderParams = {
    ...order,
    quoteId,
    appData: order.appData.toString(),
    validTo: order.validTo.toString(),
    summary,
  }

  const ethTxOptions = { value: etherValue.quotient.toString() }
  const estimatedGas = await ethFlowContract.estimateGas.createOrder(ethOrderParams, ethTxOptions).catch((error) => {
    logTradeFlowError(
      'ETH FLOW',
      '[EthFlow::SignEthFlowOrderStep] Error estimating createOrder gas. Using default ' + GAS_LIMIT_DEFAULT,
      error,
    )
    return GAS_LIMIT_DEFAULT
  })

  const gasLimit = calculateGasMargin(estimatedGas)
  // Ensure the Eth flow contract network matches the network where you place the transaction.
  // There are multiple wallet implementations, and potential race conditions that can cause the chain of the wallet to be different,
  // and therefore leaving the chainId implicit might lead the user to place an order in an unwanted chain.
  // This is especially dangerous for Eth Flow orders, because the contract address is different for the distinct networks,
  // and this can lead to loss of funds.
  //
  // Thus, we are not using a higher level of abstraction as it doesn't allow to explicitly set the chainId:
  // const txReceipt = await ethFlowContract.createOrder(ethOrderParams, {
  //   ...ethTxOptions,
  //   gasLimit: calculateGasMargin(estimatedGas),
  // })
  //
  // So we must build the tx first:
  const tx = await ethFlowContract.populateTransaction.createOrder(ethOrderParams, {
    ...ethTxOptions,
    gasLimit,
  })

  const intentionEventId = logEthSendingIntention({
    chainId: tradeFlowContext.context.chainId,
    urlChainId: getRawCurrentChainIdFromUrl(),
    amount: tradeFlowContext.context.inputAmount.quotient.toString(),
    account: tradeFlowContext.orderParams.account,
    tx,
  })
  // Then send the is using the contract's signer where the chainId is an acceptable parameter
  const txReceipt = await ethFlowContract.signer.sendTransaction({ ...tx, chainId: network })

  logEthSendingTransaction({ txHash: txReceipt.hash, intentionEventId })

  addInFlightOrderId(orderId)

  logTradeFlow('ETH FLOW', '[EthFlow::SignEthFlowOrderStep] Sent transaction onchain', orderId, txReceipt)

  return {
    txReceipt,
    order: mapUnsignedOrderToOrder({
      unsignedOrder: order,
      additionalParams: {
        ...orderParams,
        // For ETH-flow we always set order class to 'market' since we don't support ETH-flow in Limit orders
        class: OrderClass.MARKET,
        orderId,
        signature: '',
        signingScheme: SigningScheme.EIP1271,
        summary,
        quoteId,
        orderCreationHash: txReceipt.hash,
        isOnChain: true, // always on-chain
      },
    }),
  }
}
