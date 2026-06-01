import { ReactNode, useMemo } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { shortenAddress } from '@cowprotocol/common-utils'
import { Loader, RowBetween, Media } from '@cowprotocol/ui'
import { useConnectionType, useIsRestoringConnection, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import iconWalletSrc from 'assets/icon/wallet.svg'
import { AlertTriangle } from 'react-feather'
import SVG from 'react-inlinesvg'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useToggleAccountModal } from 'modules/account/hooks/useToggleAccountModal'

import { CowSwapAnalyticsCategory, CowSwapGtmEvent, toCowSwapGtmEvent } from 'common/analytics/types'
import { usePendingActivitiesCount } from 'common/hooks/usePendingActivitiesCount'

import * as styledEl from './WalletStatusButton.styled'

import { useShowUnfillableOrderAlert } from '../../hooks/useShowUnfillableOrderAlert'
import { StatusIcon } from '../../pure/StatusIcon'

export type WalletStatusButtonVariant = 'navBarDefault' | 'navBarAffiliate' | 'regularButton' | 'widget'

export interface WalletStatusButtonProps {
  variant: WalletStatusButtonVariant
}

export function WalletStatusButton({ variant }: WalletStatusButtonProps): ReactNode {
  const connectionType = useConnectionType()
  const { account } = useWalletInfo()
  const isConnectionRestoring = useIsRestoringConnection()
  const { ensName } = useWalletDetails()

  const toggleAccountModal = useToggleAccountModal()
  const toggleWalletModal = useToggleWalletModal()

  const pendingCount = usePendingActivitiesCount()
  const showUnfillableOrdersAlert = useShowUnfillableOrderAlert()

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
      <styledEl.WalletStatusButtonConnected id="web3-status-connected" $variant={variant} onClick={toggleAccountModal}>
        {pendingCount > 0 ? (
          <RowBetween gap="6px">
            <styledEl.Text>
              <Trans>{pendingCount} Pending</Trans>
            </styledEl.Text>{' '}
            {showUnfillableOrdersAlert ? (
              <styledEl.UnfillableWarning>
                <AlertTriangle size={18} />
              </styledEl.UnfillableWarning>
            ) : (
              <Loader stroke="currentColor" />
            )}
          </RowBetween>
        ) : (
          <>
            <styledEl.Text>
              {ensName || shortenAddress(account, isUpToTiny ? 4 : isUpToExtraSmall ? 3 : 4)}
            </styledEl.Text>
            <StatusIcon connectionType={connectionType} />
          </>
        )}
      </styledEl.WalletStatusButtonConnected>
    )
  }

  if (isConnectionRestoring) {
    return (
      <styledEl.WalletStatusButton id="wallet-restoring" $variant={variant} disabled>
        <styledEl.Text>
          <Trans>Restoring wallet...</Trans>
        </styledEl.Text>
      </styledEl.WalletStatusButton>
    )
  }

  return (
    <styledEl.WalletStatusButton
      id="connect-wallet"
      $variant={variant}
      onClick={toggleWalletModal}
      data-click-event={toCowSwapGtmEvent(connectWalletEvent)}
    >
      <styledEl.Text>
        <Trans>Connect wallet</Trans>
      </styledEl.Text>
      {variant === 'widget' ? <SVG src={iconWalletSrc} title={t`Wallet`} /> : null}
    </styledEl.WalletStatusButton>
  )
}
