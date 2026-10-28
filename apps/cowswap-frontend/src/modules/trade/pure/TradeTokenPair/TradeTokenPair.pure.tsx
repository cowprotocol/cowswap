import { ReactNode } from 'react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import {
  CurrencyAmountPreview,
  CurrencyAmountPreviewVariant,
  CurrencyPreviewInfo,
} from 'common/pure/CurrencyAmountPreview'
import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'

import * as styledEl from './TradeTokenPair.styled'

export interface TradeTokenPairProps {
  variant: CurrencyAmountPreviewVariant
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  footer?: ReactNode
  inputTestId?: string
  outputTestId?: string
  className?: string
}

export function TradeTokenPair({
  variant,
  inputCurrencyInfo,
  outputCurrencyInfo,
  priceImpact,
  footer,
  inputTestId,
  outputTestId,
  className,
}: TradeTokenPairProps): ReactNode {
  const isBridging = getAreBridgeCurrencies(inputCurrencyInfo.amount?.currency, outputCurrencyInfo.amount?.currency)
  const hasFooter = Boolean(footer)

  return (
    <styledEl.Wrapper className={className} $hasFooter={hasFooter} data-testid="trade-token-pair">
      <styledEl.PairGrid>
        <CurrencyAmountPreview
          variant={variant}
          id="input-currency-preview"
          testId={inputTestId}
          currencyInfo={inputCurrencyInfo}
          isBridging={isBridging}
        />

        <styledEl.AmountsSeparator />

        <CurrencyAmountPreview
          variant={variant}
          id="output-currency-preview"
          testId={outputTestId}
          currencyInfo={outputCurrencyInfo}
          priceImpactParams={priceImpact}
          isBridging={isBridging}
        />
      </styledEl.PairGrid>

      {footer ? <styledEl.Footer data-testid="trade-token-pair-footer">{footer}</styledEl.Footer> : null}
    </styledEl.Wrapper>
  )
}
