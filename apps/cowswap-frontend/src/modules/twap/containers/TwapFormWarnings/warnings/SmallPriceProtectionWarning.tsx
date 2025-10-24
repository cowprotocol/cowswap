import { InlineBanner } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SmallPriceProtectionWarning() {
  return (
    <InlineBanner>
      <strong>
        <Trans>Attention</Trans>
      </strong>
      <p>
        <Trans>
          Since prices can change significantly over time, we suggest increasing your price protection for orders with
          long deadlines.
        </Trans>
      </p>
    </InlineBanner>
  )
}
