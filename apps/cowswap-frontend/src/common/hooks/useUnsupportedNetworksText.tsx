import { ReactElement } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { Trans } from '@lingui/macro'

export function useUnsupportedNetworksText(): ReactElement {
  return (
    <Trans>
      Please connect your wallet to one of our supported networks:
      <br />
     </Trans>
  )
}
