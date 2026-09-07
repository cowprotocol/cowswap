import { ReactNode } from 'react'

import { useLatestNonNullRef } from '@cowprotocol/common-hooks'
import { CurrencyAmount } from '@cowprotocol/currency'
import { useENS } from '@cowprotocol/ens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useTwapOrderById } from 'entities/twap'
import JSBI from 'jsbi'

import { PendingOrdersPrices } from 'modules/orders'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { calculatePrice } from 'utils/orderUtils/calculatePrice'

import { getReceiptCancellationAction } from './getReceiptCancellationAction'
import { useCloseReceiptModal, useGetAlternativeOrderModalContext, useSelectedOrder } from './OrdersReceiptModal.hooks'

import { useOrderActions } from '../../hooks/useOrderActions'
import { ReceiptModal } from '../../pure/ReceiptModal/ReceiptModal.modal'

interface OrdersReceiptModalProps {
  pendingOrdersPrices: PendingOrdersPrices
}

export function OrdersReceiptModal({ pendingOrdersPrices }: OrdersReceiptModalProps): ReactNode {
  // TODO: can we get selected order from URL by id?
  const selectedOrder = useSelectedOrder()
  // Keep the last order after close so BottomDrawerOrDialog can animate out with content still mounted.
  const lastOrderRef = useLatestNonNullRef(selectedOrder)
  const order = selectedOrder ?? lastOrderRef.current
  const isOpen = selectedOrder !== null
  const { chainId } = useWalletInfo()
  const closeReceiptModal = useCloseReceiptModal()
  const { name: receiverEnsName } = useENS((order?.receiver ?? undefined) as `0x${string}` | undefined)

  const twapOrderById = useTwapOrderById(order?.id)
  const twapOrderByParentId = useTwapOrderById(order?.composableCowInfo?.parentId)
  const twapOrder = twapOrderById || twapOrderByParentId
  const isTwapPartOrder = !!twapOrderByParentId

  const isChainIdDeprecated = useIsProviderNetworkDeprecated()
  const alternativeOrderModalContextFromHook = useGetAlternativeOrderModalContext(order)
  const alternativeOrderModalContext = isChainIdDeprecated ? undefined : alternativeOrderModalContextFromHook
  const orderActions = useOrderActions()
  const showCancellationModal = getReceiptCancellationAction(order, orderActions.getShowCancellationModal)

  if (!chainId || !order) {
    return <ReceiptModal isOpen={false} onDismiss={closeReceiptModal} order={null} />
  }

  const { inputToken, outputToken, buyAmount, sellAmount } = order
  const { executedBuyAmount, executedSellAmount } = order.executionData
  const buyAmountCurrency = CurrencyAmount.fromRawAmount(outputToken, buyAmount.toString())

  const limitPrice = calculatePrice({
    buyAmount: JSBI.BigInt(buyAmount.toString()),
    sellAmount: JSBI.BigInt(sellAmount.toString()),
    inputToken,
    outputToken,
  })

  const executionPrice = calculatePrice({
    buyAmount: executedBuyAmount,
    sellAmount: executedSellAmount,
    inputToken,
    outputToken,
  })

  // Executes at price
  const { estimatedExecutionPrice = null } = pendingOrdersPrices[order.id] || {}

  return (
    <ReceiptModal
      receiverEnsName={receiverEnsName}
      buyAmount={buyAmountCurrency}
      limitPrice={limitPrice}
      executionPrice={executionPrice}
      estimatedExecutionPrice={estimatedExecutionPrice}
      chainId={chainId}
      order={order}
      twapOrder={twapOrder}
      isTwapPartOrder={isTwapPartOrder}
      isOpen={isOpen}
      onDismiss={closeReceiptModal}
      alternativeOrderModalContext={alternativeOrderModalContext}
      showCancellationModal={showCancellationModal}
    />
  )
}
