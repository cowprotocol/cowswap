import { useCallback, useState } from 'react'
import * as styledEl from './styled'
import { CurrencySelectButton } from '../CurrencySelectButton'
import { Currency } from '@uniswap/sdk-core'
import CurrencySearchModal from '@src/components/SearchModal/CurrencySearchModal'
import { useAppDispatch } from '@src/state/hooks'
import { Field, selectCurrency } from '@src/state/swap/actions'

interface BuiltItProps {
  className: string
}

export interface CurrencyInputPanelProps extends Partial<BuiltItProps> {
  field: Field
  typedValue?: string
  currency?: Currency
}

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const loading = false
  const { currency, className, field, typedValue } = props
  const [sourceCurrencyValue, setSourceCurrencyValue] = useState(typedValue || '1')
  const [isCurrencySearchModalOpen, setCurrencySearchModalOpen] = useState(false)

  const dispatch = useAppDispatch()
  const onCurrencySelect = useCallback(
    (currency: Currency) => {
      const currencyId = currency.isToken ? currency.address : currency.isNative ? 'ETH' : ''
      dispatch(selectCurrency({ field, currencyId }))
    },
    [dispatch, field]
  )

  return (
    <>
      <styledEl.Wrapper className={className}>
        <styledEl.CurrencyInputBox>
          <div>
            <CurrencySelectButton onClick={() => setCurrencySearchModalOpen(true)} currency={currency} />
          </div>
          <div>
            <styledEl.NumericalInput
              value={sourceCurrencyValue}
              onUserInput={setSourceCurrencyValue}
              $loading={loading}
            />
          </div>
          <div>
            <styledEl.BalanceText>Balance: 0 WXDAI</styledEl.BalanceText>
          </div>
          <div>
            <styledEl.BalanceText>≈ $22.82</styledEl.BalanceText>
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
