import { TokenLogo } from '@cowprotocol/tokens'
import { TokenSymbol } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Nullish } from 'types'

import * as styledEl from './styled'

export interface CurrencySelectButtonProps {
  currency?: Nullish<Currency>
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
      disabled={readonlyMode}
      onClick={onClick}
      isLoading={loading}
      $stubbed={$stubbed}
    >
      {currency ? <TokenLogo token={currency} size={24} /> : <div></div>}
      <styledEl.CurrencySymbol className="token-symbol-container" $stubbed={$stubbed}>
        {currency ? <TokenSymbol token={currency} length={40} /> : <Trans>Select a token</Trans>}
      </styledEl.CurrencySymbol>
      {readonlyMode ? null : $stubbed ? <styledEl.ArrowDown $stubbed={$stubbed} /> : <styledEl.ArrowDown />}
    </styledEl.CurrencySelectWrapper>
  )
}
