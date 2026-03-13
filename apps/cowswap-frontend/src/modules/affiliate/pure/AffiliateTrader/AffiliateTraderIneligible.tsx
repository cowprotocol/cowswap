import { ReactNode } from 'react'

import SAD_COW_FACE_ILLUSTRATION from '@cowprotocol/assets/cow-swap/sad-cow-face.svg'

import { Trans } from '@lingui/react/macro'

import { IneligibleCard, IneligibleImage, IneligibleSubtitle, IneligibleTitle } from '../shared'
import { TraderIneligible } from '../TraderIneligible'

export function AffiliateTraderIneligible(): ReactNode {
  return (
    <IneligibleCard>
      <IneligibleImage src={SAD_COW_FACE_ILLUSTRATION} ariaHidden />

      <IneligibleTitle>
        <Trans>Your wallet is ineligible</Trans>
      </IneligibleTitle>
      <IneligibleSubtitle>
        <TraderIneligible />
      </IneligibleSubtitle>
    </IneligibleCard>
  )
}
