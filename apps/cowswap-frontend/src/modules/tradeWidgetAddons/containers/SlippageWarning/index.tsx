import { JSX } from 'react'

import { RowBetween, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { DefaultTheme } from 'styled-components/macro'

interface WarningProps {
  error: boolean
  tooLow: boolean
  tooHigh: boolean
  min: number
  max: number
  theme: DefaultTheme
}

export function SlippageWarningMessage({ error, tooLow, tooHigh, min, max, theme }: WarningProps): JSX.Element | null {
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
