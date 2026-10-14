import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TEST_IDS } from '@cowprotocol/test-ids'
import { InfoTooltip } from '@cowprotocol/ui'

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
  prefix?: ReactNode
  secondaryAmount?: CurrencyPreviewSecondaryAmount
}

export interface CurrencyPreviewProps extends Partial<BuiltItProps> {
  variant?: CurrencyAmountPreviewVariant
  id: string
  currencyInfo: CurrencyPreviewInfo
  isBridging?: boolean
  priceImpactParams?: PriceImpact
}

export interface CurrencyPreviewSecondaryAmount {
  amount: CurrencyAmount<Currency>
  prefix?: ReactNode
  tooltip?: ReactNode
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
  const { fiatAmount, amount, prefix, secondaryAmount } = currencyInfo
  const topLabel = currencyInfo.label
  const currency = amount?.currency
  const secondaryCurrency = secondaryAmount?.amount.currency
  const containerClassName = [className, variant === 'slim' ? 'slim' : null].filter(Boolean).join(' ')

  return (
    <styledEl.Container id={id} className={containerClassName}>
      <styledEl.TopLabel>{topLabel}</styledEl.TopLabel>
      <styledEl.TokenLogo token={currency} size={TOKEN_SIZE_DEFAULT} />
      <styledEl.Amounts>
        <styledEl.Amount
          testId={TEST_IDS.currencyAmountPreviewValue}
          amount={amount}
          tokenSymbol={currency}
          prefix={prefix}
        />
        {secondaryAmount ? (
          <styledEl.SecondaryAmount>
            <styledEl.SecondaryAmountValue
              amount={secondaryAmount.amount}
              tokenSymbol={secondaryCurrency}
              prefix={secondaryAmount.prefix}
            />
            {secondaryAmount.tooltip ? <InfoTooltip content={secondaryAmount.tooltip} size={12} /> : null}
          </styledEl.SecondaryAmount>
        ) : (
          <styledEl.FiatAmountSlot
            fiatValue={fiatAmount}
            priceImpactParams={priceImpactParams}
            isBridging={isBridging}
          />
        )}
      </styledEl.Amounts>
    </styledEl.Container>
  )
}
