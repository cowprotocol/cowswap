import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { LimitPriceRow } from './LimitPriceRow'
import { SlippageRow } from './SlippageRow'
import * as styledEl from './styled'

type Props = {
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
}

export function TwapConfirmDetails(props: Props) {
  const { inputCurrencyInfo, outputCurrencyInfo } = props
  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  return (
    <styledEl.Wrapper>
      {/* Price */}
      <styledEl.StyledRateInfo label="Price" stylized={true} rateInfoParams={rateInfoParams} />

      {/* Slippage */}
      <SlippageRow />

      {/* Limit Price */}
      <LimitPriceRow rateInfoParams={rateInfoParams} />
    </styledEl.Wrapper>
  )
}
