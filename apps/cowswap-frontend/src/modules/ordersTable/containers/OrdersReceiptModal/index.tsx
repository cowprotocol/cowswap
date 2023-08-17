import { CurrencyAmount } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import useENS from 'legacy/hooks/useENS'

import { PendingOrdersPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import { ReceiptModal } from 'modules/ordersTable/pure/ReceiptModal'
import { useTwapOrderById, useTwapOrderByChildId } from 'modules/twap'
import { useWalletInfo } from 'modules/wallet'

import { calculatePrice } from 'utils/orderUtils/calculatePrice'

import { useCloseReceiptModal, useSelectedOrder } from './hooks'

export type OrdersReceiptModalProps = {
  pendingOrdersPrices: PendingOrdersPrices
}

export function OrdersReceiptModal(props: OrdersReceiptModalProps) {
  // TODO: can we get selected order from URL by id?
  const order = useSelectedOrder()
  const { chainId } = useWalletInfo()
  const closeReceiptModal = useCloseReceiptModal()
  const { name: receiverEnsName } = useENS(order?.receiver)

  const twapOrderById = useTwapOrderById(order?.id)
  const twapOrderByChildId = useTwapOrderByChildId(order?.id)
  const twapOrder = twapOrderById || twapOrderByChildId
  const isTwapPartOrder = !!twapOrderByChildId

  if (!chainId || !order) {
    return null
  }

  const { inputToken, outputToken, buyAmount, sellAmount } = order
  const { executedBuyAmount, executedSellAmount } = order.executionData
  // Sell and buy amounts
  const sellAmountCurrency = CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString())
  const buyAmountCurrency = CurrencyAmount.fromRawAmount(outputToken, buyAmount.toString())

  // Limit price
  const limitPrice = calculatePrice({
    buyAmount: JSBI.BigInt(buyAmount.toString()),
    sellAmount: JSBI.BigInt(sellAmount.toString()),
    inputToken,
    outputToken,
  })

  // Execution price
  const executionPrice = calculatePrice({
    buyAmount: executedBuyAmount,
    sellAmount: executedSellAmount,
    inputToken,
    outputToken,
  })

  // Executes at price
  const { pendingOrdersPrices } = props

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
    />
  )
}
