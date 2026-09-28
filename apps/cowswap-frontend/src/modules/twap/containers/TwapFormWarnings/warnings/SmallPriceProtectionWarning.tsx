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
          Prices can change over longer durations. Parts may be skipped if your <em>worst acceptable price</em> can’t be
          met.
        </Trans>
      </p>
    </InlineBanner>
  )
}
