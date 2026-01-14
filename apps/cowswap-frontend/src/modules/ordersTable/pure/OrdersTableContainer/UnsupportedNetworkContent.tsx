import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'
import { ReactNode } from 'react'

import * as styledEl from './OrdersTableContainer.styled'
import { useWalletIcon } from 'modules/ordersTable/hooks/useWalletIcon'

export function UnsupportedNetworkContent(): ReactNode {
  const walletIcon = useWalletIcon()

  // TODO: Replace with proper icon.
  
  return (
    <styledEl.Content>
      {walletIcon ? (
        <span>
          <SVG src={walletIcon} description={t`unsupported network`} />
        </span>
      ) : null}
      <h4>
        <Trans>Unsupported network</Trans>
      </h4>
      <p>
        <Trans>Please switch to a supported network to view your orders.</Trans>
      </p>
    </styledEl.Content>
  )
}
