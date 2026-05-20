import { ReactNode } from 'react'

import svgWalletPlusSrc from '@cowprotocol/assets/cow-swap/wallet-plus.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { Web3Status } from 'modules/wallet'

import { usePendingActivitiesCount } from 'common/hooks/usePendingActivitiesCount'

import * as styledEl from '../../Container/OrdersTableContainer.styled'

export function OrdersTableNoWalletContent(): ReactNode {
  const pendingActivitiesCount = usePendingActivitiesCount()

  return (
    <styledEl.Content>
      <styledEl.ConnectWalletIconWrapper>
        <SVG src={svgWalletPlusSrc} description={t`connect wallet`} />
      </styledEl.ConnectWalletIconWrapper>
      <h4>
        <Trans>Connect a wallet</Trans>
      </h4>
      {!isInjectedWidget() && pendingActivitiesCount > 0 && <Web3Status />}
    </styledEl.Content>
  )
}
