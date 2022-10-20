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
  const stubbed = !currency || false

  return (
    <styledEl.CurrencySelectWrapper
      className="open-currency-select-button"
      onClick={onClick}
      isLoading={loading}
      stubbed={stubbed}
    >
      {currency ? <CurrencyLogo currency={currency} size={'24px'} /> : <div></div>}
      <styledEl.CurrencySymbol className="token-symbol-container" stubbed={stubbed}>
        {currency ? currency.symbol : <Trans>Select a token</Trans>}
      </styledEl.CurrencySymbol>
      {stubbed ? <styledEl.ArrowDown stubbed /> : <styledEl.ArrowDown />}
    </styledEl.CurrencySelectWrapper>
  )
}
