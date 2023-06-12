import { Dispatch, SetStateAction, useMemo } from 'react'

import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ONE_HUNDRED_PERCENT } from 'legacy/constants/misc'
import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'

import { usePrice } from 'common/hooks/usePrice'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { LimitPriceRow } from './LimitPriceRow'
import { MinReceivedRow } from './MinReceivedRow'
import { SlippageRow } from './SlippageRow'
import * as styledEl from './styled'

type Props = {
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  isInvertedState: [boolean, Dispatch<SetStateAction<boolean>>]
  slippage: Percent
}

export function TradeBasicConfirmDetails(props: Props) {
  const { inputCurrencyInfo, outputCurrencyInfo, isInvertedState, slippage } = props

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  // This is the minimum per part
  const minReceivedAmountPerPart = useMemo(
    () => getSlippageAdjustedBuyAmount(outputCurrencyInfo.amount, slippage),
    [slippage, outputCurrencyInfo.amount]
  )
  const minReceivedUsdAmount = useHigherUSDValue(minReceivedAmountPerPart)

  // Limit price is the same for all parts
  const limitPrice = usePrice(inputCurrencyInfo.amount, minReceivedAmountPerPart)

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
      <MinReceivedRow amount={minReceivedAmountPerPart} usdAmount={minReceivedUsdAmount} />
    </styledEl.Wrapper>
  )
}

function getSlippageAdjustedBuyAmount(
  buyAmount: Nullish<CurrencyAmount<Currency>>,
  slippage: Percent
): CurrencyAmount<Currency> | undefined {
  return buyAmount?.multiply(ONE_HUNDRED_PERCENT.subtract(slippage))
}
