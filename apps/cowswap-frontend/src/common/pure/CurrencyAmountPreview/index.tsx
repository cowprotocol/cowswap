import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TEST_IDS } from '@cowprotocol/test-ids'

import { Nullish } from 'types'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import * as styledEl from './styled'
import { TOKEN_SIZE_DEFAULT } from './styled'

export type CurrencyAmountPreviewVariant = 'default' | 'slim'

export interface CurrencyPreviewInfo {
  amount: Nullish<CurrencyAmount<Currency>>
  fiatAmount: Nullish<CurrencyAmount<Currency>>
  balance: Nullish<CurrencyAmount<Currency>>
  label?: Nullish<string>
}

export interface CurrencyPreviewProps extends Partial<BuiltItProps> {
  variant?: CurrencyAmountPreviewVariant
  id: string
  currencyInfo: CurrencyPreviewInfo
  isBridging?: boolean
  priceImpactParams?: PriceImpact
}

interface BuiltItProps {
  className: string
}

export function CurrencyAmountPreview({
  variant = 'default',
  id,
  currencyInfo,
  className,
  priceImpactParams,
  isBridging,
}: CurrencyPreviewProps): ReactNode {
  const { fiatAmount, amount } = currencyInfo
  const topLabel = currencyInfo.label
  const currency = amount?.currency
  const containerClassName = [className, variant === 'slim' ? 'slim' : null].filter(Boolean).join(' ')

  return (
    <styledEl.Container id={id} className={containerClassName}>
      <styledEl.TopLabel>{topLabel}</styledEl.TopLabel>
      <styledEl.TokenLogo token={currency} size={TOKEN_SIZE_DEFAULT} />
      <styledEl.Amounts>
        <styledEl.Amount testId={TEST_IDS.currencyAmountPreviewValue} amount={amount} tokenSymbol={currency} />
        <styledEl.FiatAmountSlot fiatValue={fiatAmount} priceImpactParams={priceImpactParams} isBridging={isBridging} />
      </styledEl.Amounts>
    </styledEl.Container>
  )
}
