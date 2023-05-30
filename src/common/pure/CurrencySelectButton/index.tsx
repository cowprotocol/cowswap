import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Nullish } from 'types'

import { CurrencyLogo } from 'common/pure/CurrencyLogo'
import { TokenSymbol } from 'common/pure/TokenSymbol'

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
