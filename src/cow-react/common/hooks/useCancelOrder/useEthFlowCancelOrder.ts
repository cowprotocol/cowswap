import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'

import { useEthFlowContract } from 'hooks/useContract'
import { Order } from 'state/orders/actions'
import { useRequestOrderCancellation, useSetOrderCancellationHash } from 'state/orders/hooks'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { logSwapFlowError } from '@cow/modules/swap/services/utils/logger'
import { ETHFLOW_GAS_LIMIT_DEFAULT } from '@cow/modules/swap/services/ethFlow/const'

const LOG_LABEL = 'CANCEL ETH FLOW ORDER'

export function useEthFlowCancelOrder() {
  const { chainId } = useWeb3React()
  const cancelEthFlowCallback = getCancelEthFlowOrderCallback(useEthFlowContract())
  const setOrderCancellationHash = useSetOrderCancellationHash()
  const cancelPendingOrder = useRequestOrderCancellation()

  return useCallback(
    async (order: Order) => {
      if (!chainId || !order || !cancelEthFlowCallback) {
        return
      }

      const receipt = await cancelEthFlowCallback(order)
      if (receipt?.hash) {
        cancelPendingOrder({ id: order.id, chainId })
        setOrderCancellationHash({ chainId, id: order.id, hash: receipt.hash })
      }
    },
    [cancelEthFlowCallback, cancelPendingOrder, chainId, setOrderCancellationHash]
  )
}

function getCancelEthFlowOrderCallback(ethFlowContract: ReturnType<typeof useEthFlowContract>) {
  return async (order: Order) => {
    if (!ethFlowContract) {
      return
    }

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

    const estimatedGas = await ethFlowContract.estimateGas.invalidateOrder(cancelOrderParams).catch((error) => {
      logSwapFlowError(LOG_LABEL, `Error estimating createOrder gas. Using default ${ETHFLOW_GAS_LIMIT_DEFAULT}`, error)
      return ETHFLOW_GAS_LIMIT_DEFAULT
    })

    return ethFlowContract.invalidateOrder(cancelOrderParams, { gasLimit: calculateGasMargin(estimatedGas) })
  }
}
