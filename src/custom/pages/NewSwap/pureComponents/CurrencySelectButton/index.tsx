import CurrencyLogo from 'components/CurrencyLogo'
import { Currency } from '@uniswap/sdk-core'
import * as styledEl from './styled'

export interface CurrencySelectButtonProps {
  currency?: Currency
  onClick?(): void
}

export function CurrencySelectButton(props: CurrencySelectButtonProps) {
  const { currency, onClick } = props

  return (
    <styledEl.CurrencySelectWrapper onClick={onClick} isLoading={!currency}>
      {currency ? <CurrencyLogo currency={currency} size={'24px'} /> : <div></div>}
      <styledEl.CurrencySymbol stubbed={!currency}>
        {currency ? currency.symbol : 'Select a token'}
      </styledEl.CurrencySymbol>
      <styledEl.ArrowDown />
    </styledEl.CurrencySelectWrapper>
  )
}
