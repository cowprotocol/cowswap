import { isSellOrder } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import type { Order } from 'legacy/state/orders/actions'

import * as styledEl from './styled'

const TOKEN_SIZE = 20

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrderIntent({ order }: { order?: Order }) {
  if (!order) return null

  const { inputToken, outputToken, kind, sellAmount, buyAmount } = order

  if (!inputToken || !outputToken || !sellAmount || !buyAmount) {
    return null
  }

  const isSell = isSellOrder(kind)

  const sellCurrencyAmount = CurrencyAmount.fromRawAmount(inputToken, sellAmount)
  const buyCurrencyAmount = CurrencyAmount.fromRawAmount(outputToken, buyAmount)

  const sellTokenPart = (
    <>
      <TokenLogo token={inputToken} size={TOKEN_SIZE} />
      <TokenAmount amount={sellCurrencyAmount} tokenSymbol={inputToken} />
    </>
  )

  const buyTokenPart = (
    <>
      <TokenLogo token={outputToken} size={TOKEN_SIZE} />
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
