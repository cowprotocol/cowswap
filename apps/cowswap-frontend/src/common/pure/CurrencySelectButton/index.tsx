import { TokenLogo } from '@cowprotocol/tokens'
import { TokenName } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Nullish } from 'types'

import * as styledEl from './styled'
import { CurrencyName, StyledTokenSymbol } from './styled'

export interface CurrencySelectButtonProps {
  currency?: Nullish<Currency>
  loading: boolean
  readonlyMode?: boolean
  displayTokenName?: boolean
  onClick?(): void
}

export function CurrencySelectButton(props: CurrencySelectButtonProps) {
  const { currency, onClick, loading, readonlyMode = false, displayTokenName = false } = props
  const $stubbed = !currency || false

  return (
    <styledEl.CurrencySelectWrapper
      className="open-currency-select-button"
      readonlyMode={readonlyMode}
      disabled={readonlyMode}
      onClick={onClick}
      isLoading={loading}
      $stubbed={$stubbed}
      displayTokenName={displayTokenName}
    >
      {currency ? <TokenLogo token={currency} size={displayTokenName ? 36 : 24} /> : <div></div>}
      <styledEl.CurrencySymbol className="token-symbol-container" $stubbed={$stubbed}>
        {currency ? (
          <>
            <StyledTokenSymbol token={currency} length={40} displayTokenName={displayTokenName} />
            {displayTokenName && (
              <CurrencyName>
                <TokenName token={currency} length={110} />
              </CurrencyName>
            )}
          </>
        ) : (
          <Trans>Select a token</Trans>
        )}
      </styledEl.CurrencySymbol>
      {readonlyMode ? null : $stubbed ? <styledEl.ArrowDown $stubbed={$stubbed} /> : <styledEl.ArrowDown />}
    </styledEl.CurrencySelectWrapper>
  )
}
