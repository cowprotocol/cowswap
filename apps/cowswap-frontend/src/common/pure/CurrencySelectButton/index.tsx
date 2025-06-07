import { ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenName } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { Nullish } from 'types'

import * as styledEl from './styled'
import { StyledTokenSymbol, TokenSubText } from './styled'

const TOKEN_SYMBOL_LENGTH = 40
const TOKEN_NAME_LENGTH = 110
const TOKEN_LOGO_SIZE = {
  LARGE: 32,
  SMALL: 28,
} as const

export interface CurrencySelectButtonProps {
  currency?: Nullish<Currency>
  loading: boolean
  readonlyMode?: boolean
  displayTokenName?: boolean
  displayChainName?: boolean
  onClick?(): void
  customSelectTokenButton?: ReactNode
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function CurrencySelectButton(props: CurrencySelectButtonProps) {
  const {
    currency,
    onClick,
    loading,
    readonlyMode = false,
    displayTokenName = false,
    displayChainName = false,
    customSelectTokenButton,
  } = props

  const $noCurrencySelected = !currency
  const showDetailedDisplay = displayTokenName || displayChainName

  if (!currency && customSelectTokenButton) {
    return (
      <div onClick={onClick} role="button" aria-label="Select custom token" tabIndex={0}>
        {customSelectTokenButton}
      </div>
    )
  }

  return (
    <styledEl.CurrencySelectWrapper
      className="open-currency-select-button"
      readonlyMode={readonlyMode}
      disabled={readonlyMode}
      onClick={onClick}
      isLoading={loading}
      $noCurrencySelected={$noCurrencySelected}
      displayTokenName={displayTokenName}
      displayChainName={displayChainName}
      role="button"
      aria-label={currency ? `Selected token: ${currency.symbol}` : 'Select a token'}
      tabIndex={readonlyMode ? -1 : 0}
    >
      {currency ? (
        <TokenLogo token={currency} size={showDetailedDisplay ? TOKEN_LOGO_SIZE.LARGE : TOKEN_LOGO_SIZE.SMALL} />
      ) : (
        <div aria-hidden="true" />
      )}
      <styledEl.CurrencySymbol className="token-symbol-container" $noCurrencySelected={$noCurrencySelected}>
        {currency ? (
          <>
            <StyledTokenSymbol
              token={currency}
              length={TOKEN_SYMBOL_LENGTH}
              displayTokenName={displayTokenName}
              displayChainName={displayChainName}
            />

            {displayTokenName && (
              <TokenSubText>
                <TokenName token={currency} maxLength={TOKEN_NAME_LENGTH} />
              </TokenSubText>
            )}
            {displayChainName && currency.chainId && (
              <TokenSubText>
                {CHAIN_INFO[currency.chainId as SupportedChainId]?.label || `ChainID: ${currency.chainId}`}
              </TokenSubText>
            )}
          </>
        ) : (
          <Trans>Select a token</Trans>
        )}
      </styledEl.CurrencySymbol>
      {readonlyMode ? null : <styledEl.ArrowDown $noCurrencySelected={$noCurrencySelected} aria-hidden="true" />}
    </styledEl.CurrencySelectWrapper>
  )
}
