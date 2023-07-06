import { Dispatch, SetStateAction } from 'react'

import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'

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
  priceLabel?: string | undefined
}

export function TradeBasicConfirmDetails(props: Props) {
  const { rateInfoParams, minReceiveAmount, isInvertedState, slippage, additionalProps } = props
  const { inputCurrencyAmount } = rateInfoParams

  const priceLabel = additionalProps?.priceLabel || 'Price'

  const minReceivedUsdAmount = useHigherUSDValue(minReceiveAmount)

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
      <SlippageRow slippage={slippage} />

      {/* Limit Price */}
      <LimitPriceRow price={limitPrice} isInvertedState={isInvertedState} />

      {/* Min received */}
      <ReviewOrderModalAmountRow
        amount={minReceiveAmount}
        fiatAmount={minReceivedUsdAmount}
        tooltip="TODO: Min received tooltip"
        label="Min received (incl. fee/slippage)"
      />
    </styledEl.Wrapper>
  )
}
