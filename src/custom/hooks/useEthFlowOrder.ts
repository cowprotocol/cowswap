import { useCallback } from 'react'

import { useEthFlowContract } from 'hooks/useContract'
import { ContractTransaction } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { useWeb3React } from '@web3-react/core'
import { getOrderParams, PostOrderParams } from '../utils/trade'

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const PRESIGN_GAS_LIMIT_DEFAULT = BigNumber.from('150000')

export type EthFlowORder = (orderParams: PostOrderParams) => Promise<ContractTransaction>

export function useEthFlowOrder(): EthFlowORder | null {
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

      const estimatedGas = await ethFlowContract.estimateGas
        .createOrder({ ...mappedOrderParams, quoteId })
        .catch((error) => {
          console.error(
            '[usePresignOrder] Error estimating createOrder gas. Using default ' + PRESIGN_GAS_LIMIT_DEFAULT,
            error
          )
          return PRESIGN_GAS_LIMIT_DEFAULT
        })

      const txReceipt = await ethFlowContract.createOrder(
        { ...mappedOrderParams, quoteId },
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
