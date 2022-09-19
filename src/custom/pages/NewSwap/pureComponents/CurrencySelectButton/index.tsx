import CurrencyLogo from 'components/CurrencyLogo'
import { Currency } from '@uniswap/sdk-core'
import * as styledEl from './styled'
import { Trans } from '@lingui/macro'

export interface CurrencySelectButtonProps {
  currency?: Currency
  loading: boolean
  onClick?(): void
}

export function CurrencySelectButton(props: CurrencySelectButtonProps) {
  const { currency, onClick, loading } = props

  return (
    <styledEl.CurrencySelectWrapper onClick={onClick} isLoading={loading} stubbed={!currency}>
      {currency ? <CurrencyLogo currency={currency} size={'24px'} /> : <div></div>}
      <styledEl.CurrencySymbol stubbed={!currency}>
        {currency ? currency.symbol : <Trans>Select a token</Trans>}
      </styledEl.CurrencySymbol>
      <styledEl.ArrowDown stubbed={!currency} />
    </styledEl.CurrencySelectWrapper>
  )
}
