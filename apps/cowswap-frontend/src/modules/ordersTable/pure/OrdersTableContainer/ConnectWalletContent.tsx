import { ReactNode } from 'react'

import imageConnectWallet from '@cowprotocol/assets/cow-swap/wallet-plus.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { Web3Status } from 'modules/wallet/containers/Web3Status'

import * as styledEl from './OrdersTableContainer.styled'

import { useOrdersTableState } from '../../hooks/useOrdersTableState'

export function ConnectWalletContent(): ReactNode {
  const { orderType, pendingActivitiesCount } = useOrdersTableState() || {}

  return (
    <styledEl.Content>
      <span>
        <SVG src={imageConnectWallet} description={t`connect wallet`} />
      </span>
      <h3>
        <Trans>Connect a wallet</Trans>
      </h3>
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
