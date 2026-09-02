import { ReactNode } from 'react'

import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

import { RwaAlternativeQuoteInfo } from '../../hooks/useRwaAlternativeQuote'

export interface RwaAlternativeQuoteProps {
  info: RwaAlternativeQuoteInfo
  onSwitch(): void
}

export function RwaAlternativeQuote({ info, onSwitch }: RwaAlternativeQuoteProps): ReactNode {
  const { alternativeAmount, alternativeCurrency, isBetter } = info
  const symbol = alternativeCurrency.symbol

  return (
    <styledEl.Wrapper type="button" isBetter={isBetter} onClick={onSwitch}>
      <span>
        ≈ <TokenAmount amount={alternativeAmount} tokenSymbol={alternativeCurrency} />
      </span>
      <styledEl.SwitchLabel>
        <Trans>Use {symbol}</Trans>
      </styledEl.SwitchLabel>
    </styledEl.Wrapper>
  )
}
