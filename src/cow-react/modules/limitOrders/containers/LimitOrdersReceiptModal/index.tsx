import { ReceiptModal as ReceiptModalPure } from '@cow/modules/limitOrders/pure/ReceiptModal'
import { useAtomValue } from 'jotai/utils'
import { receiptAtom } from '@cow/modules/limitOrders/state/limitOrdersReceiptAtom'
import { useCloseReceiptModal } from './hooks'
import { useWeb3React } from '@web3-react/core'
import { supportedChainId } from '@src/custom/utils/supportedChainId'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'

function getExecutionPrice(order: ParsedOrder) {
  if (
    !order ||
    !order.executedBuyAmount ||
    !order.executedSellAmount ||
    order.executedBuyAmount.isEqualTo(0) ||
    order.executedSellAmount.isEqualTo(0)
  ) {
    return null
  }

  return new Fraction(order.executedBuyAmount.toNumber(), order.executedSellAmount.toNumber())
}

export function LimitOrdersReceiptModal() {
  const { selected: order } = useAtomValue(receiptAtom)
  const { chainId: _chainId } = useWeb3React()
  const closeReceiptModal = useCloseReceiptModal()
  const chainId = supportedChainId(_chainId)

  if (!chainId || !order) {
    return null
  }

  // Sell and buy amounts
  const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())

  // Limit price
  const limitPrice = new Fraction(order.buyAmount.toString(), order.sellAmount.toString())

  // Execution price
  const executionPrice = getExecutionPrice(order)

  return (
    <ReceiptModalPure
      sellAmount={sellAmount}
      buyAmount={buyAmount}
      limitPrice={limitPrice}
      executionPrice={executionPrice}
      chainId={chainId}
      order={order}
      isOpen={!!order}
      onDismiss={closeReceiptModal}
    />
  )
}
