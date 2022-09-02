import { useState } from 'react'
import * as styledEl from './styled'
import { CurrencySelectButton } from '../CurrencySelectButton'
import { Currency } from '@uniswap/sdk-core'

interface BuiltItProps {
  className: string
}

export interface CurrencyInputPanelProps extends Partial<BuiltItProps> {
  currency?: Currency
}

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const loading = false
  const { currency, className } = props
  const [sourceCurrencyValue, setSourceCurrencyValue] = useState('1')

  return (
    <styledEl.Wrapper className={className}>
      <styledEl.CurrencyInputBox>
        <div>
          <CurrencySelectButton currency={currency} />
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
  )
}
