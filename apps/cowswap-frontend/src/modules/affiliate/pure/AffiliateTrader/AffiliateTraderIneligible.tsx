import { ReactNode } from 'react'

import svgSadCowFaceSrc from '@cowprotocol/assets/cow-swap/sad-cow-face.svg'

import { Trans } from '@lingui/react/macro'

import { IneligibleCard, IneligibleImage, IneligibleSubtitle, IneligibleTitle } from '../shared'
import { TraderIneligible } from '../TraderIneligible'

export function AffiliateTraderIneligible(): ReactNode {
  return (
    <IneligibleCard>
      <IneligibleImage src={svgSadCowFaceSrc} ariaHidden />

      <IneligibleTitle>
        <Trans>Your wallet is ineligible</Trans>
      </IneligibleTitle>
      <IneligibleSubtitle>
        <TraderIneligible />
      </IneligibleSubtitle>
    </IneligibleCard>
  )
}
