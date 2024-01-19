import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import * as styledEl from './styled'

import { FiatValue } from '../FiatValue'

interface BuiltItProps {
  className: string
}

export interface CurrencyPreviewInfo {
  amount: Nullish<CurrencyAmount<Currency>>
  fiatAmount: Nullish<CurrencyAmount<Currency>>
  balance: Nullish<CurrencyAmount<Currency>>
  label?: Nullish<string>
}

export interface CurrencyPreviewProps extends Partial<BuiltItProps> {
  id: string
  currencyInfo: CurrencyPreviewInfo
  priceImpactParams?: PriceImpact
}

export function CurrencyAmountPreview(props: CurrencyPreviewProps) {
  const { currencyInfo, className, priceImpactParams } = props
  const { fiatAmount, amount } = currencyInfo
  const topLabel = currencyInfo.label
  const currency = amount?.currency

  return (
    <styledEl.Container className={className}>
      <div>{topLabel}</div>
      <div>
        <styledEl.TokenLogoWrapper>
          <TokenLogo token={currency} size={42} />
        </styledEl.TokenLogoWrapper>
      </div>
      <styledEl.Amount>
        <TokenAmount amount={amount} tokenSymbol={currency} />
      </styledEl.Amount>
      <div>
        <FiatValue fiatValue={fiatAmount} priceImpactParams={priceImpactParams} />
      </div>
    </styledEl.Container>
  )
}
