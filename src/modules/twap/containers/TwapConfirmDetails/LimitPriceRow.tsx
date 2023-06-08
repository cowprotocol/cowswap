import { Dispatch, SetStateAction } from 'react'

import { Currency, Price } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ConfirmDetailsItem } from 'modules/twap/pure/ConfirmDetailsItem'

import { ExecutionPrice } from 'common/pure/ExecutionPrice'

type Props = {
  price: Nullish<Price<Currency, Currency>>
  isInvertedState: [boolean, Dispatch<SetStateAction<boolean>>]
}

export function LimitPriceRow(props: Props) {
  const { price, isInvertedState } = props
  const [isInverted, setIsInverted] = isInvertedState

  return (
    // TODO: style button
    <button onClick={() => setIsInverted((curr) => !curr)}>
      <ConfirmDetailsItem tooltip="TODO: limit price tooltip text" label="Limit price (incl fee/slippage)">
        {price ? (
          <ExecutionPrice executionPrice={price} isInverted={isInverted} showBaseCurrency separatorSymbol="=" />
        ) : (
          '-'
        )}
      </ConfirmDetailsItem>
    </button>
  )
}
