import { useMemo } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { Loader, RowBetween } from '@cowprotocol/ui'
import { ConnectionType } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'
import ICON_WALLET from 'assets/icon/wallet.svg'
import SVG from 'react-inlinesvg'

import { upToExtraSmall, upToTiny, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent, CowSwapGtmEvent } from 'common/analytics/types'

import { Text, Web3StatusConnect, Web3StatusConnected } from './styled'

import { StatusIcon } from '../StatusIcon'

export interface Web3StatusInnerProps {
  account?: string
  pendingCount: number
  connectWallet: Command
  connectionType: ConnectionType
  ensName?: string | null
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Web3StatusInner(props: Web3StatusInnerProps) {
  const { account, pendingCount, ensName, connectionType, connectWallet } = props

  const hasPendingTransactions = !!pendingCount
  const isUpToExtraSmall = useMediaQuery(upToExtraSmall)
  const isUpToTiny = useMediaQuery(upToTiny)

  const connectWalletEvent = useMemo(
    (): CowSwapGtmEvent => ({
      category: CowSwapAnalyticsCategory.WALLET,
      action: 'Connect wallet button click',
      label: `${connectionType}${ensName ? ' (ENS)' : ''}`,
      value: pendingCount,
    }),
    [connectionType, ensName, pendingCount],
  )

  if (account) {
    return (
      <Web3StatusConnected id="web3-status-connected" pending={hasPendingTransactions}>
        {hasPendingTransactions ? (
          <RowBetween gap="6px">
            <Text>
              <Trans>{pendingCount} Pending</Trans>
            </Text>{' '}
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
    <Web3StatusConnect
      id="connect-wallet"
      onClick={connectWallet}
      data-click-event={toCowSwapGtmEvent(connectWalletEvent)}
    >
      <Text>
        <Trans>Connect wallet</Trans>
      </Text>
      <SVG src={ICON_WALLET} title="Wallet" />
    </Web3StatusConnect>
  )
}
