import { useCallback, useState } from 'react'
import * as styledEl from './styled'
import { CurrencySelectButton } from '../CurrencySelectButton'
import { Currency, Percent } from '@uniswap/sdk-core'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { formatSmartAmount } from 'utils/format'
import { CurrencyInfo } from 'pages/NewSwap/typings'
import { FiatValue } from 'components/CurrencyInputPanel/FiatValue'
import { useSwapActionHandlers } from 'state/swap/hooks'
import { Trans } from '@lingui/macro'

interface BuiltItProps {
  className: string
}

export interface CurrencyInputPanelProps extends Partial<BuiltItProps> {
  currencyInfo: CurrencyInfo
  priceImpact?: Percent
}

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const loading = false
  const priceImpactLoading = false
  const { currencyInfo, className, priceImpact } = props
  const { field, currency, balance, fiatAmount, viewAmount } = currencyInfo
  const [isCurrencySearchModalOpen, setCurrencySearchModalOpen] = useState(false)

  const { onCurrencySelection, onUserInput: onUserInputDispatch } = useSwapActionHandlers()
  const onCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelection(field, currency)
    },
    [onCurrencySelection, field]
  )
  const onUserInput = useCallback(
    (typedValue: string) => {
      onUserInputDispatch(field, typedValue)
    },
    [onUserInputDispatch, field]
  )

  return (
    <>
      <styledEl.Wrapper className={className}>
        <styledEl.CurrencyInputBox>
          <div>
            <CurrencySelectButton onClick={() => setCurrencySearchModalOpen(true)} currency={currency || undefined} />
          </div>
          <div>
            <styledEl.NumericalInput value={viewAmount} onUserInput={onUserInput} $loading={loading} />
          </div>
          <div>
            {balance && (
              <styledEl.BalanceText>
                <Trans>Balance</Trans>: {formatSmartAmount(balance) || '0'} {currency?.symbol}
              </styledEl.BalanceText>
            )}
          </div>
          <div>
            <styledEl.BalanceText>
              <FiatValue priceImpactLoading={priceImpactLoading} fiatValue={fiatAmount} priceImpact={priceImpact} />
            </styledEl.BalanceText>
          </div>
        </styledEl.CurrencyInputBox>
      </styledEl.Wrapper>

      <CurrencySearchModal
        isOpen={isCurrencySearchModalOpen}
        onDismiss={() => setCurrencySearchModalOpen(false)}
        onCurrencySelect={onCurrencySelect}
        selectedCurrency={currency}
        otherSelectedCurrency={currency}
        showCommonBases={true}
        showCurrencyAmount={false}
        disableNonToken={false}
      />
    </>
  )
}
