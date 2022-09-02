import CurrencyLogo from 'components/CurrencyLogo'
import { Currency } from '@uniswap/sdk-core'
import * as styledEl from './styled'

export interface CurrencySelectButtonProps {
  currency?: Currency
}

export function CurrencySelectButton(props: CurrencySelectButtonProps) {
  const { currency } = props

  return (
    <styledEl.CurrencySelectWrapper isLoading={!currency}>
      {currency ? <CurrencyLogo currency={currency} size={'24px'} /> : <div></div>}
      <styledEl.CurrencySymbol stubbed={!currency}>
        {currency ? currency.symbol : 'Select a token'}
      </styledEl.CurrencySymbol>
      <styledEl.ArrowDown />
    </styledEl.CurrencySelectWrapper>
  )
}
