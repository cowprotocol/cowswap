import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TEST_IDS } from '@cowprotocol/test-ids'
import { FiatAmount, InfoTooltip } from '@cowprotocol/ui'

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
  testId?: string
  currencyInfo: CurrencyPreviewInfo
  isBridging?: boolean
  priceImpactParams?: PriceImpact
}

export interface CurrencyPreviewSecondaryAmount {
  amount: CurrencyAmount<Currency>
  fiatAmount?: Nullish<CurrencyAmount<Currency>>
  prefix?: ReactNode
  tooltip?: ReactNode
  variant?: 'default' | 'success'
}

interface BuiltItProps {
  className: string
}

export function CurrencyAmountPreview({
  variant = 'default',
  id,
  testId,
  currencyInfo,
  className,
  priceImpactParams,
  isBridging,
}: CurrencyPreviewProps): ReactNode {
  const { fiatAmount, amount, prefix, secondaryAmount } = currencyInfo
  const topLabel = currencyInfo.label
  const currency = amount?.currency
  const containerClassName = [className, variant === 'slim' ? 'slim' : null].filter(Boolean).join(' ')

  return (
    <styledEl.Container id={id} className={containerClassName} data-testid={testId}>
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
          <SecondaryAmountRow secondaryAmount={secondaryAmount} />
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

function SecondaryAmountRow({ secondaryAmount }: { secondaryAmount: CurrencyPreviewSecondaryAmount }): ReactNode {
  const tokenAmount = (
    <styledEl.SecondaryAmountValue
      amount={secondaryAmount.amount}
      tokenSymbol={secondaryAmount.amount.currency}
      prefix={secondaryAmount.prefix}
    />
  )
  const fiatAmount = secondaryAmount.fiatAmount ? (
    <FiatAmount amount={secondaryAmount.fiatAmount} accurate={false} withParentheses />
  ) : null
  const tooltip = secondaryAmount.tooltip ? (
    <styledEl.SecondaryAmountTooltip>
      <InfoTooltip content={secondaryAmount.tooltip} size={12} />
    </styledEl.SecondaryAmountTooltip>
  ) : null

  return (
    <styledEl.SecondaryAmount $variant={secondaryAmount.variant} data-testid="currency-preview-secondary-amount">
      {fiatAmount || !tooltip ? tokenAmount : null}
      {fiatAmount || tooltip ? (
        <styledEl.SecondaryAmountEnd>
          {!fiatAmount ? tokenAmount : null}
          {fiatAmount}
          {tooltip}
        </styledEl.SecondaryAmountEnd>
      ) : null}
    </styledEl.SecondaryAmount>
  )
}
