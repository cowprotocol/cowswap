import { shortenAddress } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { Loader, RowBetween } from '@cowprotocol/ui'
import { ConnectionType } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'
import ICON_WALLET from 'assets/icon/wallet.svg'
import SVG from 'react-inlinesvg'

import { upToTiny, upToExtraSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { Text, Web3StatusConnect, Web3StatusConnected } from './styled'

import { FollowPendingTxPopup } from '../../containers/FollowPendingTxPopup'
import { StatusIcon } from '../StatusIcon'

export interface Web3StatusInnerProps {
  account?: string
  pendingCount: number
  connectWallet: Command | null
  connectionType: ConnectionType
  ensName?: string | null
}

export function Web3StatusInner(props: Web3StatusInnerProps) {
  const { account, pendingCount, ensName, connectionType, connectWallet } = props

  const hasPendingTransactions = !!pendingCount
  const isUpToExtraSmall = useMediaQuery(upToExtraSmall)
  const isUpToTiny = useMediaQuery(upToTiny)

  if (!connectWallet) {
    return null
  }

  if (account) {
    return (
      <Web3StatusConnected id="web3-status-connected" pending={hasPendingTransactions}>
        {hasPendingTransactions ? (
          <RowBetween gap="6px">
            <FollowPendingTxPopup>
              <Text>
                <Trans>{pendingCount} Pending</Trans>
              </Text>{' '}
            </FollowPendingTxPopup>
            <Loader stroke="currentColor" />
          </RowBetween>
        ) : (
          <Text>{ensName || shortenAddress(account, isUpToTiny ? 4 : isUpToExtraSmall ? 3 : 4)}</Text>
        )}
        {!hasPendingTransactions && <StatusIcon connectionType={connectionType} />}
      </Web3StatusConnected>
    )
  }

  return (
    <Web3StatusConnect id="connect-wallet" onClick={connectWallet} faded={!account}>
      <Text>
        <Trans>Connect wallet</Trans>
      </Text>
      <SVG src={ICON_WALLET} title="Wallet" />
    </Web3StatusConnect>
  )
}
