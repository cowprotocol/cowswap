import CurrencyLogo from 'components/CurrencyLogo'
import { Currency } from '@uniswap/sdk-core'
import * as styledEl from './styled'
import { Trans } from '@lingui/macro'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'

export interface CurrencySelectButtonProps {
  currency?: Currency
  loading: boolean
  readonlyMode?: boolean
  onClick?(): void
}

export function CurrencySelectButton(props: CurrencySelectButtonProps) {
  const { currency, onClick, loading, readonlyMode = false } = props
  const $stubbed = !currency || false

  return (
    <styledEl.CurrencySelectWrapper
      className="open-currency-select-button"
      readonlyMode={readonlyMode}
      onClick={onClick}
      isLoading={loading}
      $stubbed={$stubbed}
    >
      {currency ? <CurrencyLogo currency={currency} size={'24px'} /> : <div></div>}
      <styledEl.CurrencySymbol className="token-symbol-container" $stubbed={$stubbed}>
        {currency ? <TokenSymbol token={currency} length={40} /> : <Trans>Select a token</Trans>}
      </styledEl.CurrencySymbol>
      {readonlyMode ? null : $stubbed ? <styledEl.ArrowDown $stubbed={$stubbed} /> : <styledEl.ArrowDown />}
    </styledEl.CurrencySelectWrapper>
  )
}
