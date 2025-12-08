import { ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenName } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'
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

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function CurrencySelectButton(props: CurrencySelectButtonProps): ReactNode {
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

  const chainId = currency?.chainId
  const bridgeChain = useBridgeSupportedNetwork(chainId)
  const chainInfo = chainId ? (CHAIN_INFO[chainId as SupportedChainId] ?? bridgeChain) : undefined

  if (!currency && customSelectTokenButton) {
    return (
      <div onClick={onClick} role="button" aria-label={t`Select custom token`} tabIndex={0}>
        {customSelectTokenButton}
      </div>
    )
  }

  const selectedToken = t`Selected token:` + ' ' + currency?.symbol || ''

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
      aria-label={currency ? selectedToken : t`Select a token`}
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
              <TokenSubText>{chainInfo?.label || `ChainID: ${currency.chainId}`}</TokenSubText>
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
