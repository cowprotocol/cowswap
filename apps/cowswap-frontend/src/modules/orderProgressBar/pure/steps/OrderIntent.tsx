import { ReactNode } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

import type { Order } from 'legacy/state/orders/actions'

import * as styledEl from './styled'

const TOKEN_SIZE = 20

export function OrderIntent({ order }: { order?: Order }): ReactNode {
  if (!order) return null

  const { inputToken, outputToken, kind, sellAmount, buyAmount, bridgeOutputAmount } = order

  if (!inputToken || !outputToken || !sellAmount || !buyAmount) {
    return null
  }

  const isSell = isSellOrder(kind)

  const sellCurrencyAmount = CurrencyAmount.fromRawAmount(inputToken, sellAmount)
  const buyCurrencyAmount = bridgeOutputAmount
    ? bridgeOutputAmount
    : CurrencyAmount.fromRawAmount(outputToken, buyAmount)

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
          <Trans>
            {sellTokenPart} for at least {buyTokenPart}
          </Trans>
        </>
      ) : (
        <>
          <Trans>
            {buyTokenPart} for at most {sellTokenPart}
          </Trans>
        </>
      )}
    </styledEl.OriginalOrderIntent>
  )
}
