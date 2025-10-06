import { ReactNode, useEffect, useState } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'

import { Web3Status } from 'modules/wallet/containers/Web3Status'

import * as styledEl from './OrdersTableContainer.styled'

import { useOrdersTableState } from '../../hooks/useOrdersTableState'

export function ConnectWalletContent(): ReactNode {
  const { orderType, pendingActivitiesCount } = useOrdersTableState() || {}
  const [walletIcon, setWalletIcon] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    void import('@cowprotocol/assets/cow-swap/wallet-plus.svg').then((module) => {
      if (!isCancelled) {
        setWalletIcon(module.default)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <styledEl.Content>
      {walletIcon ? (
        <span>
          <SVG src={walletIcon} description="connect wallet" />
        </span>
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
