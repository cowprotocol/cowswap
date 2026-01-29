import { ReactNode } from 'react'

import ICON_WALLET from '@cowprotocol/assets/cow-swap/wallet-plus.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { useOrdersTableState } from '../../../../hooks/useOrdersTableState'
import * as styledEl from '../../Container/OrdersTableContainer.styled'

export function OrdersTableNoWalletContent(): ReactNode {
  const { orderType, pendingActivitiesCount } = useOrdersTableState() || {}

  return (
    <styledEl.Content>
      <styledEl.ConnectWalletIconWrapper>
        <SVG src={ICON_WALLET} description={t`connect wallet`} />
      </styledEl.ConnectWalletIconWrapper>
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
