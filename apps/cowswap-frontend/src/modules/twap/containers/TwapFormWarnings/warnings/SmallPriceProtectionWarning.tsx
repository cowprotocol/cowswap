import { ReactNode } from 'react'

import { InlineBanner } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

export function SmallPriceProtectionWarning(): ReactNode {
  return (
    <InlineBanner>
      <strong>
        <Trans>Attention</Trans>
      </strong>
      <p>
        <Trans>
          For longer orders, consider increasing the percentage next to <em>Worst acceptable price</em>. This may help
          more parts complete, but also allows them to trade at a worse price.
        </Trans>
      </p>
    </InlineBanner>
  )
}
