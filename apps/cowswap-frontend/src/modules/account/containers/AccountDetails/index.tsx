import { Fragment, ReactNode } from 'react'

import { styled } from '@cowprotocol/common-hooks'
import { getEtherscanLink, getExplorerAddressLink, getExplorerLabel } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { ExternalLink } from '@cowprotocol/ui'
import {
  ConnectionType,
  getIsInjectedMobileBrowser,
  useConnectionType,
  useDisconnectWallet,
  useIsWalletConnect,
  useWalletDetails,
  useWalletInfo,
} from '@cowprotocol/wallet'

import { i18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { LogOut } from 'react-feather'

import { groupActivitiesByDay, useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { useAppDispatch } from 'legacy/state/hooks'
import { updateSelectedWallet } from 'legacy/state/user/reducer'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { StatusIcon } from 'modules/wallet/pure/StatusIcon'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { UnsupportedNetworksText } from 'common/pure/UnsupportedNetworksText'

import { AccountIcon } from './AccountIcon'
import { ActivitiesList } from './ActivitiesList'
import {
  AccountControl,
  AccountGroupingRow,
  AddressLink,
  InfoCard,
  LinksSeparator,
  LowerSection,
  NoActivityMessage,
  UnsupportedWalletBox,
  WalletAction,
  WalletActions,
  WalletName,
  WalletNameCopy,
  WalletSecondaryActions,
  WalletSelector,
  WalletWrapper,
  Wrapper,
} from './styled'
import { SurplusCard } from './SurplusCard'

import { useCloseAccountModal } from '../../hooks/useToggleAccountModal'
import { CowShedInfo } from '../CowShedInfo'
import { CreationDateText } from '../Transaction/styled'

const CowShedInfoStyled = styled(CowShedInfo)`
  color: inherit;
  font-size: inherit;
  font-weight: normal;
  text-decoration: underline;

  &:hover,
  &:focus {
    opacity: 1;
  }
`

const DATE_FORMAT_OPTION: Intl.DateTimeFormatOptions = {
  dateStyle: 'long',
}

export interface AccountDetailsProps {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  handleCloseOrdersPanel: Command
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function AccountDetails({
  pendingTransactions = [],
  confirmedTransactions = [],
  ENSName,
  handleCloseOrdersPanel,
}: AccountDetailsProps): ReactNode {
  const { account, chainId } = useWalletInfo()
  const connectionType = useConnectionType()
  const walletDetails = useWalletDetails()
  const dispatch = useAppDispatch()
  const disconnectWallet = useDisconnectWallet()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const closeAccountModal = useCloseAccountModal()
  const { standaloneMode } = useInjectedWidgetParams()

  const explorerOrdersLink = account && getExplorerAddressLink(chainId, account)
  const explorerLabel = account ? getExplorerLabel(chainId, 'address', account) : undefined

  const activities = useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) })
  const activitiesGroupedByDate = groupActivitiesByDay(activities)
  const activityTotalCount = activities?.length || 0

  const isWalletConnect = useIsWalletConnect()
  const isInjectedMobileBrowser = getIsInjectedMobileBrowser()

  // In case the wallet is connected via WalletConnect and has wallet name set, add the suffix to be clear
  // This to avoid confusion for instance when using Metamask mobile
  // When name is not set, it defaults to WalletConnect already
  const walletConnectSuffix = isWalletConnect && walletDetails?.walletName ? ` ` + t`(via WalletConnect)` : ''

  const handleDisconnectClick = async (): Promise<void> => {
    await disconnectWallet()
    handleCloseOrdersPanel()
    dispatch(updateSelectedWallet({ wallet: undefined }))
  }

  return (
    <Wrapper>
      <InfoCard>
        <AccountGroupingRow id="web3-account-identifier-row">
          <AccountControl>
            <WalletWrapper>
              <WalletSelector>
                <StatusIcon connectionType={connectionType} account={account} size={24} />
                {(ENSName || account) && (
                  <WalletNameCopy
                    address={ENSName ? ENSName : account ? account : ''}
                    displayAddress={ENSName || undefined}
                    aria-label={t`Copy wallet`}
                  />
                )}
              </WalletSelector>
            </WalletWrapper>

            <WalletActions>
              <WalletName>
                <Trans>Connected with</Trans>
                <AccountIcon size={16} account={account} />
                {walletDetails?.walletName} {walletConnectSuffix}
                <LinksSeparator aria-hidden="true">·</LinksSeparator>
                {!isInjectedMobileBrowser && account && !isChainIdUnsupported && (
                  <AddressLink href={getEtherscanLink(chainId, 'address', ENSName ? ENSName : account)}>
                    {explorerLabel} ↗
                  </AddressLink>
                )}
                <LinksSeparator aria-hidden="true">·</LinksSeparator>
                <CowShedInfoStyled onClick={closeAccountModal} />
              </WalletName>
            </WalletActions>
          </AccountControl>
        </AccountGroupingRow>
        <AccountGroupingRow>
          <AccountControl>
            <WalletSecondaryActions>
              {standaloneMode !== false && connectionType !== ConnectionType.GNOSIS_SAFE && (
                <WalletAction onClick={handleDisconnectClick}>
                  <LogOut size={14} />
                  <Trans>Disconnect</Trans>
                </WalletAction>
              )}
            </WalletSecondaryActions>
          </AccountControl>
        </AccountGroupingRow>
      </InfoCard>

      {isChainIdUnsupported ? (
        <UnsupportedWalletBox>
          <UnsupportedNetworksText />
        </UnsupportedWalletBox>
      ) : (
        <>
          <SurplusCard />

          {activityTotalCount ? (
            <LowerSection>
              <span>
                {' '}
                <h5>
                  <Trans>Recent Activity</Trans> <span>{`(${activityTotalCount})`}</span>
                </h5>
                {explorerOrdersLink && (
                  <ExternalLink href={explorerOrdersLink}>
                    <Trans>View all orders</Trans> ↗
                  </ExternalLink>
                )}
              </span>

              <div>
                {activitiesGroupedByDate.map(({ date, activities }) => (
                  <Fragment key={date.getTime()}>
                    {/* TODO: style me! */}
                    <CreationDateText>{date.toLocaleString(i18n.locale, DATE_FORMAT_OPTION)}</CreationDateText>
                    <ActivitiesList activities={activities} />
                  </Fragment>
                ))}
                {explorerOrdersLink && (
                  <ExternalLink href={explorerOrdersLink}>
                    <Trans>View all orders</Trans> ↗
                  </ExternalLink>
                )}
              </div>
            </LowerSection>
          ) : (
            <LowerSection>
              <NoActivityMessage>
                <span>
                  <Trans>Your activity will appear here...</Trans>
                </span>
              </NoActivityMessage>
            </LowerSection>
          )}
        </>
      )}
    </Wrapper>
  )
}
