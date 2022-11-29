import JSBI from 'jsbi'
import { useAtomValue } from 'jotai/utils'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { receiptAtom } from '@cow/modules/limitOrders/state/limitOrdersReceiptAtom'
import { ReceiptModal } from '@cow/modules/limitOrders/pure/ReceiptModal'
import { calculatePrice } from '@cow/modules/limitOrders/utils/calculatePrice'

import { supportedChainId } from 'utils/supportedChainId'
import { useCloseReceiptModal } from './hooks'

export function OrdersReceiptModal() {
  // TODO: can we get selected order from URL by id?
  const { selected: order } = useAtomValue(receiptAtom)
  const { chainId: _chainId } = useWeb3React()
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

  return (
    <ReceiptModal
      sellAmount={sellAmountCurrency}
      buyAmount={buyAmountCurrency}
      limitPrice={limitPrice}
      executionPrice={executionPrice}
      chainId={chainId}
      order={order}
      isOpen={!!order}
      onDismiss={closeReceiptModal}
    />
  )
}
