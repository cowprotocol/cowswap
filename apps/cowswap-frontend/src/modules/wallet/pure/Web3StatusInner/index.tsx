import { ReactNode, useMemo } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { shortenAddress } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { Loader, RowBetween, Media } from '@cowprotocol/ui'
import { ConnectionType } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import ICON_WALLET from 'assets/icon/wallet.svg'
import { AlertCircle } from 'react-feather'
import SVG from 'react-inlinesvg'

import { CowSwapAnalyticsCategory, CowSwapGtmEvent, toCowSwapGtmEvent } from 'common/analytics/types'

import { Text, UnfillableWarning, Web3StatusConnect, Web3StatusConnected } from './styled'

import { StatusIcon } from '../StatusIcon'

export interface Web3StatusInnerProps {
  account?: string
  pendingCount: number
  connectWallet: Command
  connectionType: ConnectionType
  ensName?: string | null
  showUnfillableOrdersAlert?: boolean
}

export function Web3StatusInner(props: Web3StatusInnerProps): ReactNode {
  const { account, pendingCount, ensName, connectionType, connectWallet, showUnfillableOrdersAlert } = props

  const hasPendingTransactions = !!pendingCount
  const isUpToExtraSmall = useMediaQuery(Media.upToExtraSmall(false))
  const isUpToTiny = useMediaQuery(Media.upToTiny(false))

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
            {showUnfillableOrdersAlert ? (
              <UnfillableWarning>
                <AlertCircle size={18} />
              </UnfillableWarning>
            ) : (
              <Loader stroke="currentColor" />
            )}
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
      faded={!account}
    >
      <Text>
        <Trans>Connect wallet</Trans>
      </Text>
      <SVG src={ICON_WALLET} title={t`Wallet`} />
    </Web3StatusConnect>
  )
}
