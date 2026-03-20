import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { CompatibilityIssuesWarning } from 'modules/trade'

import { TradeFormBlankButton } from '../TradeFormBlankButton'

import type { ButtonComponentProps } from './tradeButtonsMap.types'

const CompatibilityIssuesWarningWrapper = styled.div`
  margin-top: -10px;
`

export function UnsupportedTokenButton({ derivedState, isSupportedWallet }: ButtonComponentProps): ReactNode {
  const { inputCurrency, outputCurrency } = derivedState

  return inputCurrency && outputCurrency ? (
    <>
      <TradeFormBlankButton disabled={true}>
        <Trans>Unsupported token</Trans>
      </TradeFormBlankButton>
      <CompatibilityIssuesWarningWrapper>
        <CompatibilityIssuesWarning
          currencyIn={inputCurrency}
          currencyOut={outputCurrency}
          isSupportedWallet={isSupportedWallet}
        />
      </CompatibilityIssuesWarningWrapper>
    </>
  ) : null
}
