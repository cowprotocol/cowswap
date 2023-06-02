import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { ONE_FRACTION } from 'legacy/constants/misc'

import { twapOrderSlippage } from 'modules/twap/state/twapOrdersSettingsAtom'

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
}

export function TwapConfirmDetails(props: Props) {
  const { inputCurrencyInfo, outputCurrencyInfo } = props

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const allowedSlippage = useAtomValue(twapOrderSlippage)

  const activeRate = usePrice(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  // Calculate limit price
  const limitPrice = useMemo(() => {
    // TODO: apply allowedSlippage to this somehow
    return activeRate?.invert()
  }, [activeRate])

  // Calculate Min Received amount
  const minReceiveAmount = useMemo(() => {
    // TODO: I'm not sure this calculation is correct and want to check with others
    return outputCurrencyInfo.amount?.multiply(ONE_FRACTION.subtract(allowedSlippage))
  }, [allowedSlippage, outputCurrencyInfo.amount])

  // TODO: calculate USD amounts for limit price and min received

  return (
    <styledEl.Wrapper>
      {/* Price */}
      <styledEl.StyledRateInfo label="Price" stylized={true} rateInfoParams={rateInfoParams} />

      {/* Slippage */}
      <SlippageRow />

      {/* Limit Price */}
      <LimitPriceRow currency={inputCurrencyInfo.amount?.currency} amount={limitPrice} />

      {/* Min received */}
      <MinReceivedRow currency={outputCurrencyInfo.amount?.currency} amount={minReceiveAmount} />
    </styledEl.Wrapper>
  )
}
