import { useState } from 'react'

import { Command } from '@cowprotocol/types'

import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { safeTokenName, TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import Icon from 'components/Icon'

import { getLimitPrice } from 'utils/getLimitPrice'

export type OrderPriceDisplayProps = {
  buyAmount: BigNumber
  buyToken: TokenErc20
  sellAmount: BigNumber
  sellToken: TokenErc20
  isPriceInverted?: boolean
  invertPrice?: Command
  showInvertButton?: boolean
}

export function OrderPriceDisplay(props: Readonly<OrderPriceDisplayProps>): React.ReactNode {
  const {
    buyAmount,
    buyToken,
    sellAmount,
    sellToken,
    isPriceInverted: parentIsInvertedPrice,
    invertPrice: parentInvertPrice,
    showInvertButton = false,
  } = props

  const [innerIsPriceInverted, setInnerIsPriceInverted] = useState(parentIsInvertedPrice)

  // Use external state management if available, otherwise use inner one
  const isPriceInverted = parentIsInvertedPrice ?? innerIsPriceInverted
  const invert = parentInvertPrice ?? ((): void => setInnerIsPriceInverted((curr) => !curr))

  const limitPrice = getLimitPrice(
    {
      buyAmount,
      buyToken,
      sellAmount,
      sellToken,
    },
    isPriceInverted || false,
  )

  const buySymbol = safeTokenName(buyToken)
  const sellSymbol = safeTokenName(sellToken)

  const baseSymbol = isPriceInverted ? sellSymbol : buySymbol

  return (
    <>
      {limitPrice} for {baseSymbol} {showInvertButton && <Icon icon={faExchangeAlt} onClick={invert} />}
    </>
  )
}
