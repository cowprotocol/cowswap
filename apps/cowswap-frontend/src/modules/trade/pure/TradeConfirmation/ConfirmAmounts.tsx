import { ReactNode } from 'react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'

import * as styledEl from './styled'

interface ConfirmAmountsProps {
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
}

export function ConfirmAmounts({ inputCurrencyInfo, outputCurrencyInfo, priceImpact }: ConfirmAmountsProps): ReactNode {
  const isBridging = getAreBridgeCurrencies(inputCurrencyInfo.amount?.currency, outputCurrencyInfo.amount?.currency)

  return (
    <styledEl.AmountsPreviewContainer>
      <CurrencyAmountPreview id="input-currency-preview" currencyInfo={inputCurrencyInfo} isBridging={isBridging} />
      <styledEl.SeparatorWrapper>
        <styledEl.AmountsSeparator />
      </styledEl.SeparatorWrapper>
      <CurrencyAmountPreview
        id="output-currency-preview"
        currencyInfo={outputCurrencyInfo}
        priceImpactParams={priceImpact}
        isBridging={isBridging}
      />
    </styledEl.AmountsPreviewContainer>
  )
}
