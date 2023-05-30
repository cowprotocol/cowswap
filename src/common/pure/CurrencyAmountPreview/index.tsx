import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Nullish } from 'types'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'
import { FiatValue } from 'common/pure/FiatValue'
import { TokenAmount } from 'common/pure/TokenAmount'

import * as styledEl from '../CurrencyInputPanel/styled'

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
  const { id, currencyInfo, className, priceImpactParams } = props
  const { balance, fiatAmount, amount } = currencyInfo
  const topLabel = currencyInfo.label
  const currency = amount?.currency

  return (
    <>
      <styledEl.Wrapper id={id} className={className} withReceiveAmountInfo={false} disabled={false}>
        {topLabel && <styledEl.CurrencyTopLabel>{topLabel}</styledEl.CurrencyTopLabel>}

        <styledEl.CurrencyInputBox>
          <div>
            <CurrencySelectButton currency={currency} loading={false} readonlyMode={true} />
          </div>
          <div>
            <styledEl.TokenAmountStyled className="token-amount-input" amount={amount} />
          </div>
        </styledEl.CurrencyInputBox>

        <styledEl.CurrencyInputBox>
          <div>
            {balance && (
              <>
                <styledEl.BalanceText>
                  <Trans>Balance</Trans>: <TokenAmount amount={balance} defaultValue="0" tokenSymbol={currency} />
                </styledEl.BalanceText>
              </>
            )}
          </div>
          <div>
            <styledEl.FiatAmountText>
              <FiatValue fiatValue={fiatAmount} priceImpactParams={priceImpactParams} />
            </styledEl.FiatAmountText>
          </div>
        </styledEl.CurrencyInputBox>
      </styledEl.Wrapper>
    </>
  )
}
