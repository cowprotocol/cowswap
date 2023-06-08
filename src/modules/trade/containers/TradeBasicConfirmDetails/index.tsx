import { Dispatch, SetStateAction } from 'react'

import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'

import { usePrice } from 'common/hooks/usePrice'
import { RateInfoParams } from 'common/pure/RateInfo'

import { LimitPriceRow } from './LimitPriceRow'
import { MinReceivedRow } from './MinReceivedRow'
import { SlippageRow } from './SlippageRow'
import * as styledEl from './styled'

type Props = {
  rateInfoParams: RateInfoParams
  minReceiveAmount: Nullish<CurrencyAmount<Currency>>
  isInvertedState: [boolean, Dispatch<SetStateAction<boolean>>]
  slippage: Percent
}

export function TradeBasicConfirmDetails(props: Props) {
  const { rateInfoParams, minReceiveAmount, isInvertedState, slippage } = props
  const { inputCurrencyAmount } = rateInfoParams

  const minReceivedUsdAmount = useHigherUSDValue(minReceiveAmount)

  // Limit price is the same for all parts
  const limitPrice = usePrice(inputCurrencyAmount, minReceiveAmount)

  return (
    <styledEl.Wrapper>
      {/* Price */}
      <styledEl.StyledRateInfo
        label="Price"
        stylized={true}
        rateInfoParams={rateInfoParams}
        isInvertedState={isInvertedState}
      />

      {/* Slippage */}
      <SlippageRow slippage={slippage} />

      {/* Limit Price */}
      <LimitPriceRow price={limitPrice} isInvertedState={isInvertedState} />

      {/* Min received */}
      <MinReceivedRow amount={minReceiveAmount} usdAmount={minReceivedUsdAmount} />
    </styledEl.Wrapper>
  )
}
