import { ReactNode } from 'react'

import { InlineBanner } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

export function ReceiveZeroFromNetworkCostsWarning(): ReactNode {
  return (
    <InlineBanner>
      <strong>
        <Trans>Sell amount too small</Trans>
      </strong>
      <p>
        <Trans>
          Network costs are higher than the value of each part, so you would receive nothing. Decrease the number of
          parts or increase the total sell amount.
        </Trans>
      </p>
    </InlineBanner>
  )
}
