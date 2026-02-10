import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'
import { AlertTriangle } from 'react-feather'

import { UnsupportedNetworksText } from 'common/pure/UnsupportedNetworksText'

import * as styledEl from '../../Container/OrdersTableContainer.styled'

export function OrdersTableUnsupportedNetworkContent(): ReactNode {
  return (
    <styledEl.Content>
      <styledEl.UnsupportedNetworkIconWrapper>
        <AlertTriangle aria-hidden />
      </styledEl.UnsupportedNetworkIconWrapper>

      <h4>
        <Trans>Unsupported network</Trans>
      </h4>

      <p>
        <UnsupportedNetworksText />
      </p>
    </styledEl.Content>
  )
}
