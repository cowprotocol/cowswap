import { Dispatch, ReactNode, SetStateAction } from 'react'

import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useUsdAmount } from 'modules/usdAmount'

import { usePrice } from 'common/hooks/usePrice'
import { RateInfoParams } from 'common/pure/RateInfo'

import { LimitPriceRow } from './LimitPriceRow'
import { SlippageRow } from './SlippageRow'
import * as styledEl from './styled'

import { ReviewOrderModalAmountRow } from '../../pure/ReviewOrderModalAmountRow'

type Props = {
  rateInfoParams: RateInfoParams
  // TODO: Add maxSendAmount when using component in swap/limit BUY orders
  minReceiveAmount: Nullish<CurrencyAmount<Currency>>
  isInvertedState: [boolean, Dispatch<SetStateAction<boolean>>]
  slippage: Percent
  additionalProps?: AdditionalProps
}

type AdditionalProps = {
  priceLabel?: ReactNode
  minReceivedLabel?: ReactNode
  minReceivedTooltip?: ReactNode
  limitPriceLabel?: ReactNode
  limitPriceTooltip?: ReactNode
  slippageLabel?: ReactNode
  slippageTooltip?: ReactNode
}

export function TradeBasicConfirmDetails(props: Props) {
  const { rateInfoParams, minReceiveAmount, isInvertedState, slippage, additionalProps } = props
  const { inputCurrencyAmount } = rateInfoParams

  const priceLabel = additionalProps?.priceLabel || 'Price'
  const minReceivedLabel = additionalProps?.minReceivedLabel || 'Min received (incl. costs)'
  const minReceivedTooltip = additionalProps?.minReceivedTooltip || 'This is the minimum amount that you will receive.'

  const minReceivedUsdAmount = useUsdAmount(minReceiveAmount).value

  // Limit price is the same for all parts
  const limitPrice = usePrice(inputCurrencyAmount, minReceiveAmount)

  return (
    <styledEl.Wrapper>
      {/* Price */}
      <styledEl.StyledRateInfo
        label={priceLabel}
        stylized={true}
        rateInfoParams={rateInfoParams}
        isInvertedState={isInvertedState}
      />

      {/* Slippage */}
      <SlippageRow slippage={slippage} {...additionalProps} />

      {/* Limit Price */}
      <LimitPriceRow price={limitPrice} isInvertedState={isInvertedState} {...additionalProps} />

      {/* Min received */}
      <ReviewOrderModalAmountRow
        highlighted={true}
        amount={minReceiveAmount}
        fiatAmount={minReceivedUsdAmount}
        tooltip={minReceivedTooltip}
        label={minReceivedLabel}
      />
    </styledEl.Wrapper>
  )
}
