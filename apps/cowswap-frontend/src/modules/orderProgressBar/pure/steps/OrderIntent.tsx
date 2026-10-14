import { ReactNode } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@cowprotocol/currency'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import type { Order } from 'legacy/state/orders/actions'

import { AddressLink } from 'common/pure/AddressLink'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'

import * as styledEl from './styled'

const TOKEN_SIZE = 20

export function OrderIntent({ order }: { order?: Order }): ReactNode {
  if (!order) return null

  const { inputToken, outputToken, kind, sellAmount, buyAmount, bridgeOutputAmount } = order

  if (!inputToken || !outputToken || !sellAmount || !buyAmount) {
    return null
  }

  const isSell = isSellOrder(kind)
  const isBridging = !!bridgeOutputAmount || inputToken.chainId !== outputToken.chainId
  const receiver = !isBridging && getIsCustomRecipient(order) ? order.receiver : null

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

  const recipientPart = receiver ? <AddressLink address={receiver} chainId={outputToken.chainId} /> : null

  return (
    <styledEl.OriginalOrderIntent>
      {isSell ? (
        recipientPart ? (
          <Trans>
            {sellTokenPart} for at least {buyTokenPart} to {recipientPart}
          </Trans>
        ) : (
          <Trans>
            {sellTokenPart} for at least {buyTokenPart}
          </Trans>
        )
      ) : recipientPart ? (
        <Trans>
          {buyTokenPart} for at most {sellTokenPart} to {recipientPart}
        </Trans>
      ) : (
        <Trans>
          {buyTokenPart} for at most {sellTokenPart}
        </Trans>
      )}
    </styledEl.OriginalOrderIntent>
  )
}
