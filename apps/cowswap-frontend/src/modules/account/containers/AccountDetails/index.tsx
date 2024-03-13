import { Fragment, useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import {
  getEtherscanLink,
  getExplorerLabel,
  shortenAddress,
  getExplorerAddressLink,
  isMobile,
} from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { ExternalLink } from '@cowprotocol/ui'
import {
  ConnectionType,
  useWalletInfo,
  getConnectionName,
  getIsCoinbaseWallet,
  getIsMetaMask,
  useWalletDetails,
  useIsWalletConnect,
  getWeb3ReactConnection,
  getIsHardWareWallet,
} from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

import { Trans } from '@lingui/macro'

import Copy from 'legacy/components/Copy'
import {
  ActivityDescriptors,
  groupActivitiesByDay,
  useMultipleActivityDescriptors,
} from 'legacy/hooks/useRecentActivity'

import Activity from 'modules/account/containers/Transaction'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useUnsupportedNetworksText } from 'common/hooks/useUnsupportedNetworksText'

import { AccountIcon } from './AccountIcon'
import {
  AccountControl,
  AccountGroupingRow,
  AddressLink,
  InfoCard,
  LowerSection,
  NetworkCard,
  NoActivityMessage,
  TransactionListWrapper,
  UnsupportedWalletBox,
  WalletAction,
  WalletActions,
  WalletName,
  WalletNameAddress,
  WalletSelector,
  WalletSecondaryActions,
  WalletWrapper,
  Wrapper,
} from './styled'
import { SurplusCard } from './SurplusCard'

import { useDisconnectWallet } from '../../hooks/useDisconnectWallet'
import { CreationDateText } from '../Transaction/styled'

export const DATE_FORMAT_OPTION: Intl.DateTimeFormatOptions = {
  dateStyle: 'long',
}

export function renderActivities(activities: ActivityDescriptors[]) {
  return (
    <TransactionListWrapper>
      {activities.map((activity) => {
        return <Activity key={activity.id} activity={activity} />
      })}
    </TransactionListWrapper>
  )
}

export interface AccountDetailsProps {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  forceHardwareWallet?: boolean
  toggleWalletModal: Command | null
  toggleAccountSelectorModal: Command
  handleCloseOrdersPanel: Command
}

export function AccountDetails({
  pendingTransactions = [],
  confirmedTransactions = [],
  ENSName,
  toggleWalletModal,
  toggleAccountSelectorModal,
  handleCloseOrdersPanel,
  forceHardwareWallet,
}: AccountDetailsProps) {
  const { account, chainId } = useWalletInfo()
  const { connector } = useWeb3React()
  const walletDetails = useWalletDetails()
  const disconnectWallet = useDisconnectWallet()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const { standaloneMode } = useInjectedWidgetParams()

  const explorerOrdersLink = account && getExplorerAddressLink(chainId, account)
  const explorerLabel = account ? getExplorerLabel(chainId, 'address', account) : undefined

  const activities = useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) })
  const activitiesGroupedByDate = groupActivitiesByDay(activities)
  const activityTotalCount = activities?.length || 0

  const isWalletConnect = useIsWalletConnect()
  const isMetaMask = getIsMetaMask()
  const isCoinbaseWallet = getIsCoinbaseWallet()
  const connection = useMemo(() => getWeb3ReactConnection(connector), [connector])
  const isInjectedMobileBrowser = (isMetaMask || isCoinbaseWallet) && isMobile

  const unsupportedNetworksText = useUnsupportedNetworksText()

  if (!toggleWalletModal) return null

  function formatConnectorName() {
    const name = walletDetails?.walletName || getConnectionName(connection.type, getIsMetaMask())
    // In case the wallet is connected via WalletConnect and has wallet name set, add the suffix to be clear
    // This to avoid confusion for instance when using Metamask mobile
    // When name is not set, it defaults to WalletConnect already

    const walletConnectSuffix = isWalletConnect && walletDetails?.walletName ? ' (via WalletConnect)' : ''

    return (
      <WalletName>
        <Trans>Connected with</Trans> {name} {walletConnectSuffix}
      </WalletName>
    )
  }

  const handleDisconnectClick = () => {
    disconnectWallet()
    handleCloseOrdersPanel()
    toggleWalletModal()
  }

  const networkLabel = CHAIN_INFO[chainId].label
  const isHardWareWallet = forceHardwareWallet || getIsHardWareWallet(connection.type)

  return (
    <Wrapper>
      <InfoCard>
        <AccountGroupingRow id="web3-account-identifier-row">
          <AccountControl>
            <WalletWrapper>
              <WalletSelector
                isHardWareWallet={isHardWareWallet}
                onClick={() => {
                  if (isHardWareWallet) {
                    toggleAccountSelectorModal()
                  }
                }}
              >
                <AccountIcon connector={connector} walletDetails={walletDetails} size={24} account={account} />

                {(ENSName || account) && (
                  <WalletNameAddress>{ENSName ? ENSName : account && shortenAddress(account)}</WalletNameAddress>
                )}
              </WalletSelector>

              {(ENSName || account) && <Copy toCopy={ENSName ? ENSName : account ? account : ''} />}
            </WalletWrapper>

            <WalletActions>
              {' '}
              {!isChainIdUnsupported && <NetworkCard title={networkLabel}>{networkLabel}</NetworkCard>}{' '}
              {formatConnectorName()}
            </WalletActions>
          </AccountControl>
        </AccountGroupingRow>
        <AccountGroupingRow>
          <AccountControl>
            <WalletSecondaryActions>
              {!isInjectedMobileBrowser && (
                <>
                  {account && !isChainIdUnsupported && (
                    <AddressLink
                      hasENS={!!ENSName}
                      isENS={!!ENSName}
                      href={getEtherscanLink(chainId, 'address', ENSName ? ENSName : account)}
                    >
                      {explorerLabel} ↗
                    </AddressLink>
                  )}

                  {standaloneMode !== false && (
                    <>
                      {connection.type !== ConnectionType.GNOSIS_SAFE && (
                        <WalletAction onClick={toggleWalletModal}>
                          <Trans>Change Wallet</Trans>
                        </WalletAction>
                      )}
                      <WalletAction onClick={handleDisconnectClick}>
                        <Trans>Disconnect</Trans>
                      </WalletAction>
                    </>
                  )}
                </>
              )}
            </WalletSecondaryActions>
          </AccountControl>
        </AccountGroupingRow>
      </InfoCard>

      {isChainIdUnsupported ? (
        <UnsupportedWalletBox>{unsupportedNetworksText}</UnsupportedWalletBox>
      ) : (
        <>
          <SurplusCard />

          {activityTotalCount ? (
            <LowerSection>
              <span>
                {' '}
                <h5>
                  Recent Activity <span>{`(${activityTotalCount})`}</span>
                </h5>
                {explorerOrdersLink && <ExternalLink href={explorerOrdersLink}>View all orders ↗</ExternalLink>}
              </span>

              <div>
                {activitiesGroupedByDate.map(({ date, activities }) => (
                  <Fragment key={date.getTime()}>
                    {/* TODO: style me! */}
                    <CreationDateText>{date.toLocaleString(undefined, DATE_FORMAT_OPTION)}</CreationDateText>
                    {renderActivities(activities)}
                  </Fragment>
                ))}
                {explorerOrdersLink && <ExternalLink href={explorerOrdersLink}>View all orders ↗</ExternalLink>}
              </div>
            </LowerSection>
          ) : (
            <LowerSection>
              <NoActivityMessage>
                <span>Your activity will appear here...</span>
              </NoActivityMessage>
            </LowerSection>
          )}
        </>
      )}
    </Wrapper>
  )
}
