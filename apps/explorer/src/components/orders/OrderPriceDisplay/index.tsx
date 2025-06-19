import { useState } from 'react'

import { Command } from '@cowprotocol/types'

import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { calculatePrice, formatSmart, invertPrice, safeTokenName, TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import Icon from 'components/Icon'

import {
  HIGH_PRECISION_DECIMALS,
  HIGH_PRECISION_SMALL_LIMIT,
  NO_ADJUSTMENT_NEEDED_PRECISION,
} from '../../../explorer/const'

export type OrderPriceDisplayProps = {
  buyAmount: string | BigNumber
  buyToken: TokenErc20
  sellAmount: string | BigNumber
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

  const calculatedPrice = calculatePrice({
    denominator: { amount: buyAmount, decimals: buyToken.decimals },
    numerator: { amount: sellAmount, decimals: sellToken.decimals },
  })
  const displayPrice = (isPriceInverted ? invertPrice(calculatedPrice) : calculatedPrice).toString(10)
  const formattedPrice = formatSmart({
    amount: displayPrice,
    precision: NO_ADJUSTMENT_NEEDED_PRECISION,
    smallLimit: HIGH_PRECISION_SMALL_LIMIT,
    decimals: HIGH_PRECISION_DECIMALS,
  })

  const buySymbol = safeTokenName(buyToken)
  const sellSymbol = safeTokenName(sellToken)

  const [baseSymbol, quoteSymbol] = isPriceInverted ? [sellSymbol, buySymbol] : [buySymbol, sellSymbol]

  return (
    <>
      {formattedPrice} {quoteSymbol} for {baseSymbol}{' '}
      {showInvertButton && <Icon icon={faExchangeAlt} onClick={invert} />}
    </>
  )
}
