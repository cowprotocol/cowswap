import { Dispatch, ReactNode, SetStateAction } from 'react'

import { Currency, Price } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'

import { ExecutionPrice } from 'common/pure/ExecutionPrice'
import { RateWrapper } from 'common/pure/RateInfo'

type Props = {
  price: Nullish<Price<Currency, Currency>>
  isInvertedState: [boolean, Dispatch<SetStateAction<boolean>>]
  limitPriceLabel?: ReactNode
  limitPriceTooltip?: ReactNode
}

export function LimitPriceRow(props: Props): ReactNode {
  const { price, isInvertedState, limitPriceLabel = 'Limit price', limitPriceTooltip = 'The limit price' } = props
  const [isInverted, setIsInverted] = isInvertedState

  return (
    <RateWrapper onClick={() => setIsInverted((curr) => !curr)}>
      <ConfirmDetailsItem withTimelineDot label={limitPriceLabel} tooltip={limitPriceTooltip}>
        {price ? (
          <ExecutionPrice
            executionPrice={price}
            isInverted={isInverted}
            hideFiat
            showBaseCurrency
            separatorSymbol="="
          />
        ) : (
          '-'
        )}
      </ConfirmDetailsItem>
    </RateWrapper>
  )
}
