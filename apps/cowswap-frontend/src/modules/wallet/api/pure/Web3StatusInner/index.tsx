import { Trans } from '@lingui/macro'

import Loader from 'legacy/components/Loader'
import FollowPendingTxPopup from 'legacy/components/Popups/FollowPendingTxPopup'
import { RowBetween } from 'legacy/components/Row'
import { shortenAddress } from 'legacy/utils'

import StatusIcon from 'modules/wallet/api/pure/StatusIcon'
import { ConnectionType } from 'modules/wallet/api/types'

import { NetworkIcon, Text, Web3StatusConnect, Web3StatusConnected, Web3StatusError } from './styled'

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
          <RowBetween>
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
    </Web3StatusConnect>
  )
}
