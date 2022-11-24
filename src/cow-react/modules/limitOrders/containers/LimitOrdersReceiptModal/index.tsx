import { ReceiptModal as ReceiptModalPure } from '@cow/modules/limitOrders/pure/ReceiptModal'
import { useAtomValue } from 'jotai/utils'
import { receiptAtom } from '@cow/modules/limitOrders/state/limitOrdersReceiptAtom'
import { useCloseReceiptModal } from './hooks'
import { useWeb3React } from '@web3-react/core'
import { supportedChainId } from '@src/custom/utils/supportedChainId'
import { CurrencyAmount, Fraction, Token } from '@uniswap/sdk-core'
import JSBI from 'jsbi'

function calculatePrice({
  buyAmount,
  sellAmount,
  inputToken,
  outputToken,
}: {
  buyAmount: JSBI | undefined
  sellAmount: JSBI | undefined
  inputToken: Token
  outputToken: Token
}) {
  const isZero = (x: JSBI) => JSBI.equal(x, JSBI.BigInt(0))

  if (!buyAmount || !sellAmount || !inputToken || !outputToken || isZero(buyAmount) || isZero(sellAmount)) {
    return null
  }

  const adjustedBuy = adjustDecimals(buyAmount, inputToken.decimals)
  const adjustedSell = adjustDecimals(sellAmount, outputToken.decimals)
  return new Fraction(adjustedBuy, adjustedSell)
}

const adjustDecimals = (amount: string | JSBI, decimals: number) => {
  return JSBI.multiply(JSBI.BigInt(amount), JSBI.BigInt(10 ** decimals))
}

export function LimitOrdersReceiptModal() {
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
    <ReceiptModalPure
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
