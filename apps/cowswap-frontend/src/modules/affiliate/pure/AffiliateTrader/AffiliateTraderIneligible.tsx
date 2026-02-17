import { ReactElement } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'

import { Trans } from '@lingui/react/macro'

import { IneligibleCard, IneligibleSubtitle, IneligibleTitle } from 'modules/affiliate/pure/shared'
import { TraderIneligible } from 'modules/affiliate/pure/TraderIneligible'

interface AffiliateTraderIneligibleProps {
  incomingIneligibleCode?: string
}

export function AffiliateTraderIneligible({ incomingIneligibleCode }: AffiliateTraderIneligibleProps): ReactElement {
  return (
    <IneligibleCard>
      <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />

      <IneligibleTitle>
        <Trans>Your wallet is ineligible</Trans>
      </IneligibleTitle>
      <IneligibleSubtitle>
        <TraderIneligible incomingCode={incomingIneligibleCode} />
      </IneligibleSubtitle>
    </IneligibleCard>
  )
}
