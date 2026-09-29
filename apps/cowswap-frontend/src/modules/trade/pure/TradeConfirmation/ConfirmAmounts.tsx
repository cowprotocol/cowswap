import { ReactNode } from 'react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import {
  CurrencyAmountPreview,
  CurrencyAmountPreviewVariant,
  CurrencyPreviewInfo,
} from 'common/pure/CurrencyAmountPreview'
import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'

import * as styledEl from './styled'

interface ConfirmAmountsProps {
  variant: CurrencyAmountPreviewVariant
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
}

export function ConfirmAmounts({
  variant,
  inputCurrencyInfo,
  outputCurrencyInfo,
  priceImpact,
}: ConfirmAmountsProps): ReactNode {
  const isBridging = getAreBridgeCurrencies(inputCurrencyInfo.amount?.currency, outputCurrencyInfo.amount?.currency)

  return (
    <styledEl.AmountsPreviewContainer $variant={variant}>
      <CurrencyAmountPreview
        variant={variant}
        id="input-currency-preview"
        currencyInfo={inputCurrencyInfo}
        isBridging={isBridging}
      />

      <styledEl.AmountsSeparator />

      <CurrencyAmountPreview
        variant={variant}
        id="output-currency-preview"
        currencyInfo={outputCurrencyInfo}
        priceImpactParams={priceImpact}
        isBridging={isBridging}
      />
    </styledEl.AmountsPreviewContainer>
  )
}
