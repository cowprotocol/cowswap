import CurrencyLogo from 'components/CurrencyLogo'
import { Currency } from '@uniswap/sdk-core'
import * as styledEl from './styled'

export interface CurrencySelectButtonProps {
  currency: Currency
}

export function CurrencySelectButton(props: CurrencySelectButtonProps) {
  const { currency } = props

  return (
    <styledEl.CurrencySelectWrapper>
      <CurrencyLogo currency={currency} size={'24px'} />
      <styledEl.CurrencySymbol>{currency.symbol}</styledEl.CurrencySymbol>
      <styledEl.ArrowDown />
    </styledEl.CurrencySelectWrapper>
  )
}
