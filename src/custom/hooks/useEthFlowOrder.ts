import { useCallback } from 'react'

import { useEthFlowContract } from 'hooks/useContract'
import { ContractTransaction } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { useWeb3React } from '@web3-react/core'
import { getOrderParams, mapUnsignedOrderToOrder, PostOrderParams } from '../utils/trade'
import { NativeCurrency } from '@uniswap/sdk-core'
import { UnsignedOrder } from '../utils/signatures'
import { packOrderUidParams } from '@cowprotocol/contracts'
import { HashZero } from '@ethersproject/constants'
import { MAX_VALID_TO_EPOCH } from './useSwapCallback'
import { EthFlowOrder } from '../state/orders/actions'

type EthFlowOrderParams = Omit<PostOrderParams, 'sellToken'> & {
  sellToken: NativeCurrency
}

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const ETHFLOW_GAS_LIMIT_DEFAULT = BigNumber.from('150000')

export type AuxOrderParams = Omit<UnsignedOrder, 'quoteId' | 'appData' | 'validTo' | 'orderId'> & {
  quoteId: number
  appData: string
  validTo: string
  summary: string
}
export type EthFlowResponse = { txReceipt: ContractTransaction; order: EthFlowOrder; orderId: string }
export type EthFlowSwapCallback = (orderParams: EthFlowOrderParams) => Promise<EthFlowResponse>

export function useEthFlowOrder(): EthFlowSwapCallback | null {
  const { chainId } = useWeb3React()
  const ethFlowContract = useEthFlowContract()

  const ethFlowOrder = useCallback<EthFlowSwapCallback>(
    async (orderParams) => {
      console.log('EthFlow Order', orderParams)
      if (!chainId) {
        throw Error('Not connected to any chain')
      }

      if (!ethFlowContract) {
        throw Error('EthFlowContract is not ready')
      }

      const { order, quoteId, summary } = getOrderParams(orderParams)

      if (!quoteId) {
        throw Error('EthFlowContract quoteId missing!')
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
          console.error(
            '[useEthFlowOrder] Error estimating createOrder gas. Using default ' + ETHFLOW_GAS_LIMIT_DEFAULT,
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

      return {
        txReceipt,
        order: {
          // TODO: CHECK SIGNATURE EMPTY STRING
          ...mapUnsignedOrderToOrder<NativeCurrency>(order, { ...orderParams, orderId, signature: '', summary }),
          isEthFlowOrder: true,
        },
        orderId,
      }
    },
    [ethFlowContract, chainId]
  )

  return ethFlowContract && ethFlowOrder
}
