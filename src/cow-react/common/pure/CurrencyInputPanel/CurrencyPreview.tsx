import React from 'react'
import * as styledEl from './styled'
import { CurrencySelectButton } from '@cow/modules/swap/pure/CurrencySelectButton'
import { formatSmartAmount } from '@cow/utils/format'
import { FiatValue } from 'components/CurrencyInputPanel/FiatValue'
import { Trans } from '@lingui/macro'
import { PriceImpact } from 'hooks/usePriceImpact'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'

interface BuiltItProps {
  className: string
}

export interface CurrencyPreviewProps extends Partial<BuiltItProps> {
  id: string
  currencyInfo: CurrencyInfo
  priceImpactParams?: PriceImpact
  topLabel?: string
}

export function CurrencyPreview(props: CurrencyPreviewProps) {
  const { id, currencyInfo, className, priceImpactParams, topLabel } = props
  const { priceImpact, loading: priceImpactLoading } = priceImpactParams || {}
  const { currency, balance, fiatAmount, viewAmount, rawAmount } = currencyInfo

  return (
    <>
      <styledEl.Wrapper id={id} className={className} withReceiveAmountInfo={false} disabled={false}>
        {topLabel && <styledEl.CurrencyTopLabel>{topLabel}</styledEl.CurrencyTopLabel>}

        <styledEl.CurrencyInputBox>
          <div>
            <CurrencySelectButton currency={currency || undefined} loading={false} readonlyMode={true} />
          </div>
          <div>
            <styledEl.NumericalInput
              title={rawAmount?.toExact() + ' ' + currency?.symbol}
              className="token-amount-input"
              readOnly={true}
              value={viewAmount}
              onUserInput={() => void 0}
              $loading={false}
            />
          </div>
        </styledEl.CurrencyInputBox>

        <styledEl.CurrencyInputBox>
          <div>
            {balance && (
              <>
                <styledEl.BalanceText title={balance.toExact() + ' ' + currency?.symbol}>
                  <Trans>Balance</Trans>: {formatSmartAmount(balance) || '0'} {<TokenSymbol token={currency} />}
                </styledEl.BalanceText>
              </>
            )}
          </div>
          <div>
            <styledEl.FiatAmountText>
              <FiatValue priceImpactLoading={priceImpactLoading} fiatValue={fiatAmount} priceImpact={priceImpact} />
            </styledEl.FiatAmountText>
          </div>
        </styledEl.CurrencyInputBox>
      </styledEl.Wrapper>
    </>
  )
}
