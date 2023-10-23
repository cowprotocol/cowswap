import { shortenAddress } from '@cowprotocol/common-utils'
import { Loader, RowBetween } from '@cowprotocol/ui'
import { ConnectionType } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'
import ICON_WALLET from 'assets/icon/wallet.svg'
import SVG from 'react-inlinesvg'

import { NetworkIcon, Text, Web3StatusConnect, Web3StatusConnected, Web3StatusError } from './styled'

import { FollowPendingTxPopup } from '../../containers/FollowPendingTxPopup'
import { StatusIcon } from '../StatusIcon'

export interface Web3StatusInnerProps {
  account?: string | null
  chainId?: number
  pendingCount: number
  error?: string
  connectWallet: () => void
  connectionType: ConnectionType
  ensName?: string | null
}

export function Web3StatusInner(props: Web3StatusInnerProps) {
  const { account, pendingCount, chainId, error, ensName, connectionType, connectWallet } = props

  const hasPendingTransactions = !!pendingCount

  if (!chainId) {
    return null
  }

  if (error) {
    return (
      <Web3StatusError>
        <NetworkIcon />
        <Text>
          <Trans>Error</Trans>
        </Text>
      </Web3StatusError>
    )
  }

  if (account) {
    return (
      <Web3StatusConnected id="web3-status-connected" pending={hasPendingTransactions}>
        {hasPendingTransactions ? (
          <RowBetween gap={'6px'}>
            <FollowPendingTxPopup>
              <Text>
                <Trans>{pendingCount} Pending</Trans>
              </Text>{' '}
            </FollowPendingTxPopup>
            <Loader stroke="white" />
          </RowBetween>
        ) : (
          <Text>{ensName || shortenAddress(account)}</Text>
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
