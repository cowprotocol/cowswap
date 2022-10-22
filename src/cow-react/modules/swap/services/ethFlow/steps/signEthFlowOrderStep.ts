import { NativeCurrency } from '@uniswap/sdk-core'
import { HashZero } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'

import { packOrderUidParams } from '@cowprotocol/contracts'
import { CoWSwapEthFlow } from '@cow/abis/types'
import { logSwapFlow, logSwapFlowError } from '@cow/modules/swap/services/utils/logger'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { getOrderParams, mapUnsignedOrderToOrder, PostOrderParams } from 'utils/trade'
import { MAX_VALID_TO_EPOCH } from 'hooks/useSwapCallback'
import { EthFlowOrder } from 'state/orders/actions'
import { UnsignedOrder } from 'utils/signatures'

type EthFlowOrderParams = Omit<PostOrderParams, 'sellToken'> & {
  sellToken: NativeCurrency
}

export type AuxOrderParams = Omit<UnsignedOrder, 'quoteId' | 'appData' | 'validTo' | 'orderId'> & {
  quoteId: number
  appData: string
  validTo: string
  summary: string
}
export type EthFlowResponse = { txReceipt: ContractTransaction; order: EthFlowOrder; orderId: string }
export type EthFlowSwapCallback = (orderParams: EthFlowOrderParams) => Promise<EthFlowResponse>

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const ETHFLOW_GAS_LIMIT_DEFAULT = BigNumber.from('150000')

export async function signEthFlowOrderStep(
  orderParams: EthFlowOrderParams,
  ethFlowContract: CoWSwapEthFlow
): Promise<EthFlowResponse> {
  logSwapFlow('ETH FLOW', '[EthFlow::SignEthFlowOrderStep] - signing orderParams onchain', orderParams)

  const { order, quoteId, summary } = getOrderParams(orderParams)

  if (!quoteId) {
    throw new Error('[EthFlow::SignEthFlowOrderStep] No quoteId passed')
  }

  const auxOrderParams: AuxOrderParams = {
    ...order,
    quoteId,
    appData: order.appData.toString(),
    validTo: order.validTo.toString(),
    summary,
  }

  const estimatedGas = await ethFlowContract.estimateGas
    .createOrder(auxOrderParams, { value: orderParams.sellAmountBeforeFee.quotient.toString() })
    .catch((error) => {
      logSwapFlowError(
        'ETH FLOW',
        '[EthFlow::SignEthFlowOrderStep] Error estimating createOrder gas. Using default ' + ETHFLOW_GAS_LIMIT_DEFAULT,
        error
      )
      return ETHFLOW_GAS_LIMIT_DEFAULT
    })

  const txReceipt = await ethFlowContract.createOrder(auxOrderParams, {
    gasLimit: calculateGasMargin(estimatedGas),
    value: orderParams.sellAmountBeforeFee.quotient.toString(),
  })

  // Generate the orderId from owner and validTo
  const orderId = packOrderUidParams({
    orderDigest: HashZero,
    owner: ethFlowContract.address,
    validTo: MAX_VALID_TO_EPOCH,
  })

  logSwapFlow('ETH FLOW', '[EthFlow::SignEthFlowOrderStep] Sent transaction onchain', orderId, txReceipt)

  return {
    txReceipt,
    order: {
      // TODO: CHECK SIGNATURE EMPTY STRING
      ...mapUnsignedOrderToOrder<NativeCurrency>(order, { ...orderParams, orderId, signature: '', summary }),
      isEthFlowOrder: true,
    },
    orderId,
  }
}
