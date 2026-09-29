import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './TwapSellAmountDescription.styled'

export function TwapSellAmountDescription(): ReactNode {
  return (
    <styledEl.Description>
      <Trans>TWAP splits your swap into equal parts over time</Trans>
    </styledEl.Description>
  )
}
