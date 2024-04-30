import React, { useState } from 'react'

import { Command } from '@cowprotocol/types'

import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { calculatePrice, formatSmart, invertPrice, safeTokenName, TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import Icon from 'components/Icon'
import styled from 'styled-components/macro'

import {
  HIGH_PRECISION_DECIMALS,
  HIGH_PRECISION_SMALL_LIMIT,
  NO_ADJUSTMENT_NEEDED_PRECISION,
} from '../../../explorer/const'

const Wrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  > span {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  > span > span:first-child {
    white-space: nowrap;
  }

  > span:first-child {
    margin: 0 0.5rem 0 0;
  }

  > span:last-child {
    white-space: nowrap;
  }
`

export type Props = {
  buyAmount: string | BigNumber
  buyToken: TokenErc20
  sellAmount: string | BigNumber
  sellToken: TokenErc20
  isPriceInverted?: boolean
  invertPrice?: Command
  showInvertButton?: boolean
}

export function OrderPriceDisplay(props: Props): JSX.Element {
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
    <Wrapper>
      <span>
        <span>{formattedPrice}</span> &nbsp;<span>{quoteSymbol}</span>
      </span>
      <span>
        for {baseSymbol}
        {showInvertButton && <Icon icon={faExchangeAlt} onClick={invert} />}
      </span>
    </Wrapper>
  )
}
