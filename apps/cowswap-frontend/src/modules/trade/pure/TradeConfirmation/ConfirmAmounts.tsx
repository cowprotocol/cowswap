import { ReactNode } from 'react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { CurrencyAmountPreview, CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import * as styledEl from './styled'

interface ConfirmAmountsProps {
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
}

export function ConfirmAmounts({ inputCurrencyInfo, outputCurrencyInfo, priceImpact }: ConfirmAmountsProps): ReactNode {
  return (
    <styledEl.AmountsPreviewContainer>
      <CurrencyAmountPreview id="input-currency-preview" currencyInfo={inputCurrencyInfo} />
      <styledEl.SeparatorWrapper>
        <styledEl.AmountsSeparator />
      </styledEl.SeparatorWrapper>
      <CurrencyAmountPreview
        id="output-currency-preview"
        currencyInfo={outputCurrencyInfo}
        priceImpactParams={priceImpact}
      />
    </styledEl.AmountsPreviewContainer>
  )
}
