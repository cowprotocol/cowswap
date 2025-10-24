import { ReactNode } from 'react'

import { RowBetween, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { DefaultTheme } from 'styled-components/macro'

import { SlippageWarningParams } from '../../containers/TransactionSlippageInput/hooks/types'

interface WarningProps {
  error: boolean
  slippageWarningParams: SlippageWarningParams
  theme: DefaultTheme
}

export function SlippageWarningMessage({
  error,
  theme,
  slippageWarningParams: { tooLow, tooHigh, min, max },
}: WarningProps): ReactNode | null {
  if (!error && !tooLow && !tooHigh) {
    return null
  }

  const color = error ? `var(${UI.COLOR_DANGER})` : theme.warning

  return (
    <RowBetween style={{ fontSize: '14px', paddingTop: '7px', color }}>
      {error ? (
        <Trans>
          Enter slippage percentage between {min}% and {max}%
        </Trans>
      ) : tooLow ? (
        <Trans>Your transaction may expire</Trans>
      ) : (
        <Trans>High slippage amount selected</Trans>
      )}
    </RowBetween>
  )
}
