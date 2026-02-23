import { ReactNode } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'

import { Trans } from '@lingui/react/macro'

import { IneligibleCard, IneligibleSubtitle, IneligibleTitle } from '../shared'
import { TraderIneligible } from '../TraderIneligible'

export function AffiliateTraderIneligible(): ReactNode {
  return (
    <IneligibleCard>
      <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />

      <IneligibleTitle>
        <Trans>Your wallet is ineligible</Trans>
      </IneligibleTitle>
      <IneligibleSubtitle>
        <TraderIneligible />
      </IneligibleSubtitle>
    </IneligibleCard>
  )
}
