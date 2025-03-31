import { isSellOrder } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { Order } from 'legacy/state/orders/actions'

import * as styledEl from '../styled'

// styled
function OrderIntent({ order }: { order?: Order }) {
  if (!order) return null

  const { inputToken, outputToken, kind, sellAmount, buyAmount } = order
  const isSell = isSellOrder(kind)

  const sellCurrencyAmount = CurrencyAmount.fromRawAmount(inputToken, sellAmount)
  const buyCurrencyAmount = CurrencyAmount.fromRawAmount(outputToken, buyAmount)

  const sellTokenPart = (
    <>
      <TokenLogo token={inputToken} size={20} />
      <TokenAmount amount={sellCurrencyAmount} tokenSymbol={inputToken} />
    </>
  )

  const buyTokenPart = (
    <>
      <TokenLogo token={outputToken} size={20} />
      <TokenAmount amount={buyCurrencyAmount} tokenSymbol={outputToken} />
    </>
  )

  return (
    <styledEl.OriginalOrderIntent>
      {isSell ? (
        <>
          {sellTokenPart} for at least {buyTokenPart}
        </>
      ) : (
        <>
          {buyTokenPart} for at most {sellTokenPart}
        </>
      )}
    </styledEl.OriginalOrderIntent>
  )
}

export default OrderIntent
