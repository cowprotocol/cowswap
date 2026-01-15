import { ReactNode } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { Web3Status } from 'modules/wallet/containers/Web3Status'

import * as styledEl from './OrdersTableContainer.styled'

import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { useWalletIcon } from '../../hooks/useWalletIcon'

export function ConnectWalletContent(): ReactNode {
  const { orderType, pendingActivitiesCount } = useOrdersTableState() || {}
  const walletIcon = useWalletIcon()

  return (
    <styledEl.Content>
      {walletIcon ? (
        <styledEl.ConnecWalletIconWrapper>
          <SVG src={walletIcon} description={t`connect wallet`} />
        </styledEl.ConnecWalletIconWrapper>
      ) : null}
      <h4>
        <Trans>Connect a wallet</Trans>
      </h4>
      {!isInjectedWidget && (
        <>
          <p>
            <Trans>
              To use {orderType} orders, please connect your wallet <br />
              to one of our supported networks.
            </Trans>
          </p>
          {pendingActivitiesCount && <Web3Status />}
        </>
      )}
    </styledEl.Content>
  )
}
