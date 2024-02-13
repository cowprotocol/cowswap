import { Dispatch, SetStateAction } from 'react'

import { Currency, Price } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'

import { ExecutionPrice } from 'common/pure/ExecutionPrice'
import { RateWrapper } from 'common/pure/RateInfo'

type Props = {
  price: Nullish<Price<Currency, Currency>>
  isInvertedState: [boolean, Dispatch<SetStateAction<boolean>>]
  limitPriceLabel?: React.ReactNode
  limitPriceTooltip?: React.ReactNode
}

export function LimitPriceRow(props: Props) {
  const { price, isInvertedState, limitPriceLabel = 'Limit price', limitPriceTooltip = 'The limit price' } = props
  const [isInverted, setIsInverted] = isInvertedState

  return (
    <RateWrapper onClick={() => setIsInverted((curr) => !curr)}>
      <ConfirmDetailsItem withTimelineDot={true} label={limitPriceLabel} labelOpacity tooltip={limitPriceTooltip}>
        {price ? (
          <ExecutionPrice executionPrice={price} isInverted={isInverted} showBaseCurrency separatorSymbol="=" />
        ) : (
          '-'
        )}
      </ConfirmDetailsItem>
    </RateWrapper>
  )
}
