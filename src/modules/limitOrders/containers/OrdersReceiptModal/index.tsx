import JSBI from 'jsbi'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { ReceiptModal } from 'modules/limitOrders/pure/ReceiptModal'
import { calculatePrice } from 'modules/limitOrders/utils/calculatePrice'

import { supportedChainId } from 'utils/supportedChainId'
import { useCloseReceiptModal, useSelectedOrder } from './hooks'
import { useWalletInfo } from 'modules/wallet'
import { PendingOrdersPrices } from 'modules/orders/state/pendingOrdersPricesAtom'

export type OrdersReceiptModalProps = {
  pendingOrdersPrices: PendingOrdersPrices
}

export function OrdersReceiptModal(props: OrdersReceiptModalProps) {
  // TODO: can we get selected order from URL by id?
  const order = useSelectedOrder()
  const { chainId: _chainId } = useWalletInfo()
  const closeReceiptModal = useCloseReceiptModal()
  const chainId = supportedChainId(_chainId)

  if (!chainId || !order) {
    return null
  }

  const { inputToken, outputToken, buyAmount, sellAmount, executedBuyAmount, executedSellAmount } = order

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
      sellAmount={sellAmountCurrency}
      buyAmount={buyAmountCurrency}
      limitPrice={limitPrice}
      executionPrice={executionPrice}
      estimatedExecutionPrice={estimatedExecutionPrice}
      chainId={chainId}
      order={order}
      isOpen={!!order}
      onDismiss={closeReceiptModal}
    />
  )
}
