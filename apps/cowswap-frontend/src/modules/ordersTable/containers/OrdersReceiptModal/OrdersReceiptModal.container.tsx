import { ReactNode } from 'react'

import { useENS } from '@cowprotocol/ens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useTwapOrderById } from 'entities/twap'
import JSBI from 'jsbi'

import { PendingOrdersPrices } from 'modules/orders'
import { useTwapOrderByChildId } from 'modules/twap'

import { calculatePrice } from 'utils/orderUtils/calculatePrice'

import { useCloseReceiptModal, useGetAlternativeOrderModalContext, useSelectedOrder } from './OrdersReceiptModal.hooks'

import { ReceiptModal } from '../../pure/ReceiptModal/ReceiptModal.modal'

interface OrdersReceiptModalProps {
  pendingOrdersPrices: PendingOrdersPrices
}

export function OrdersReceiptModal({ pendingOrdersPrices }: OrdersReceiptModalProps): ReactNode {
  // TODO: can we get selected order from URL by id?
  const order = useSelectedOrder()
  const { chainId } = useWalletInfo()
  const closeReceiptModal = useCloseReceiptModal()
  const { name: receiverEnsName } = useENS(order?.receiver)

  const twapOrderById = useTwapOrderById(order?.id)
  const twapOrderByChildId = useTwapOrderByChildId(order?.id)
  const twapOrder = twapOrderById || twapOrderByChildId
  const isTwapPartOrder = !!twapOrderByChildId

  const alternativeOrderModalContext = useGetAlternativeOrderModalContext(order)

  if (!chainId || !order) {
    return null
  }

  const { inputToken, outputToken, buyAmount, sellAmount } = order
  const { executedBuyAmount, executedSellAmount } = order.executionData
  // Sell and buy amounts
  const sellAmountCurrency = CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString())
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
      sellAmount={sellAmountCurrency}
      buyAmount={buyAmountCurrency}
      limitPrice={limitPrice}
      executionPrice={executionPrice}
      estimatedExecutionPrice={estimatedExecutionPrice}
      chainId={chainId}
      order={order}
      twapOrder={twapOrder}
      isTwapPartOrder={isTwapPartOrder}
      isOpen={!!order}
      onDismiss={closeReceiptModal}
      alternativeOrderModalContext={alternativeOrderModalContext}
    />
  )
}
