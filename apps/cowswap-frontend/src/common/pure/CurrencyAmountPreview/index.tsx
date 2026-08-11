import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenLogo } from '@cowprotocol/tokens'

import { Nullish } from 'types'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import * as styledEl from './styled'

const TOKEN_LOGO_SIZE = 42

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
      <div>{topLabel}</div>
      <div>
        <styledEl.TokenLogoWrapper>
          <TokenLogo token={currency} size={TOKEN_LOGO_SIZE} />
        </styledEl.TokenLogoWrapper>
      </div>
      <styledEl.Amounts>
        <styledEl.Amount className="token-amount-input" amount={amount} tokenSymbol={currency} />
        <styledEl.FiatAmountSlot fiatValue={fiatAmount} priceImpactParams={priceImpactParams} isBridging={isBridging} />
      </styledEl.Amounts>
    </styledEl.Container>
  )
}
