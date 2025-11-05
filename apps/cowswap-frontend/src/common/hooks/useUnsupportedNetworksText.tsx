import { ReactElement } from 'react'

import { Trans } from '@lingui/macro'

export function useUnsupportedNetworksText(): ReactElement {
  // TODO: turn into a pure component now that it doesn't need additional info
  return (
    <Trans>
      Please connect your wallet to one of our supported networks.
    </Trans>
  )
}
