import { useCallback } from 'react'

import { useEthFlowContract } from 'hooks/useContract'
import { ContractTransaction } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { useWeb3React } from '@web3-react/core'
import { getOrderParams, PostOrderParams } from '../utils/trade'

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const ETHFLOW_GAS_LIMIT_DEFAULT = BigNumber.from('150000')

export type EthFlowORder = (orderParams: PostOrderParams) => Promise<ContractTransaction>

export function useEthFlowOrderCallback(): EthFlowORder | null {
  const { chainId } = useWeb3React()
  const ethFlowContract = useEthFlowContract()

  const ethFlowOrder = useCallback<EthFlowORder>(
    async (orderParams) => {
      console.log('EthFlow Order', orderParams)
      if (!chainId) {
        throw Error('Not connected to any chain')
      }

      if (!ethFlowContract) {
        throw Error('EthFlowContract is not ready')
      }

      const { order: mappedOrderParams, quoteId } = getOrderParams(orderParams)

      if (!quoteId) {
        throw Error('EthFlowContract quoteId missing!')
      }

      /* 
        buyToken: string;
        receiver: string;
        sellAmount: BigNumber | Bytes | bigint | string | number;
        buyAmount: BigNumber | Bytes | bigint | string | number;
        appData: Bytes | string;
        feeAmount: BigNumber | Bytes | bigint | string | number;
        validTo: BigNumber | Bytes | bigint | string | number;
        partiallyFillable: boolean;
        quoteId: BigNumber | Bytes | bigint | string | number;
      */

      const estimatedGas = await ethFlowContract.estimateGas
        .createOrder({
          ...mappedOrderParams,
          quoteId,
          appData: mappedOrderParams.appData.toString(),
          validTo: mappedOrderParams.validTo.toString(),
        })
        .catch((error) => {
          console.error(
            '[useEthFlowOrder] Error estimating createOrder gas. Using default ' + ETHFLOW_GAS_LIMIT_DEFAULT,
            error
          )
          return ETHFLOW_GAS_LIMIT_DEFAULT
        })

      const txReceipt = await ethFlowContract.createOrder(
        {
          ...mappedOrderParams,
          quoteId,
          appData: mappedOrderParams.appData.toString(),
          validTo: mappedOrderParams.validTo.toString(),
        },
        {
          gasLimit: calculateGasMargin(estimatedGas),
        }
      )

      console.log('Sent transaction for EthFlow order', orderParams, txReceipt)

      return txReceipt
    },
    [ethFlowContract, chainId]
  )

  return ethFlowContract && ethFlowOrder
}
