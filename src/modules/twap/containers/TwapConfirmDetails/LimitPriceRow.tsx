import { Dispatch, SetStateAction } from 'react'

import { Currency, Price } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ConfirmDetailsItem } from 'modules/twap/pure/ConfirmDetailsItem'

import { ExecutionPrice } from 'common/pure/ExecutionPrice'
import { RateWrapper } from 'common/pure/RateInfo'

type Props = {
  price: Nullish<Price<Currency, Currency>>
  isInvertedState: [boolean, Dispatch<SetStateAction<boolean>>]
}

export function LimitPriceRow(props: Props) {
  const { price, isInvertedState } = props
  const [isInverted, setIsInverted] = isInvertedState

  return (
    <RateWrapper onClick={() => setIsInverted((curr) => !curr)}>
      <ConfirmDetailsItem tooltip="TODO: limit price tooltip text" label="Limit price (incl fee/slippage)">
        {price ? (
          <ExecutionPrice executionPrice={price} isInverted={isInverted} showBaseCurrency separatorSymbol="=" />
        ) : (
          '-'
        )}
      </ConfirmDetailsItem>
    </RateWrapper>
  )
}
