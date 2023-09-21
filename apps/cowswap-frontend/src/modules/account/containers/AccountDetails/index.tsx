import { Fragment, useMemo } from 'react'

import {
  getEtherscanLink,
  getExplorerLabel,
  shortenAddress,
  getExplorerAddressLink,
  isMobile,
} from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { MouseoverTooltip } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'
import {
  ConnectionType,
  useWalletInfo,
  WalletDetails,
  getConnectionIcon,
  getConnectionName,
  getIsCoinbaseWallet,
  getIsMetaMask,
  Identicon,
  useWalletDetails,
  useIsWalletConnect,
  getWeb3ReactConnection,
  getIsHardWareWallet,
} from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { Trans } from '@lingui/macro'

import Copy from 'legacy/components/Copy'
import {
  ActivityDescriptors,
  groupActivitiesByDay,
  useMultipleActivityDescriptors,
} from 'legacy/hooks/useRecentActivity'

import Activity from 'modules/account/containers/Transaction'

import { UNSUPPORTED_WALLET_TEXT } from 'common/containers/WalletUnsupportedNetworkBanner'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import {
  AccountControl,
  AccountGroupingRow,
  AddressLink,
  IconWrapper,
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

export const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.GOERLI]: 'Görli',
  [ChainId.GNOSIS_CHAIN]: 'Gnosis Chain',
}

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

export function getStatusIcon(connector: Connector, walletDetails?: WalletDetails, size?: number) {
  const connectionType = getWeb3ReactConnection(connector)

  if (walletDetails && !walletDetails.isSupportedWallet) {
    /* eslint-disable jsx-a11y/accessible-emoji */
    return (
      <MouseoverTooltip text="This wallet is not yet supported">
        <IconWrapper role="img" aria-label="Warning sign. Wallet not supported">
          ⚠️
        </IconWrapper>
      </MouseoverTooltip>
    )
    /* eslint-enable jsx-a11y/accessible-emoji */
  }
  if (walletDetails?.icon) {
    return (
      <IconWrapper size={16}>
        <img src={walletDetails.icon} alt={`${walletDetails?.walletName || 'wallet'} logo`} />
      </IconWrapper>
    )
  }

  const icon = getConnectionIcon(connectionType.type)

  if (icon === 'Identicon') {
    return <Identicon size={size} />
  }

  return (
    <IconWrapper size={16}>
      <img src={icon} alt={`${connectionType.type} logo`} />
    </IconWrapper>
  )
}

export interface AccountDetailsProps {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  forceHardwareWallet?: boolean
  toggleWalletModal: () => void
  toggleAccountSelectorModal: () => void
  handleCloseOrdersPanel: () => void
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

  const networkLabel = NETWORK_LABELS[chainId]
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
                {getStatusIcon(connector, walletDetails, 24)}
                {(ENSName || account) && (
                  <WalletNameAddress>{ENSName ? ENSName : account && shortenAddress(account)}</WalletNameAddress>
                )}
              </WalletSelector>

              {(ENSName || account) && <Copy toCopy={ENSName ? ENSName : account ? account : ''} />}
            </WalletWrapper>

            <WalletActions>
              {' '}
              {networkLabel && !isChainIdUnsupported && (
                <NetworkCard title={networkLabel}>{networkLabel}</NetworkCard>
              )}{' '}
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
            </WalletSecondaryActions>
          </AccountControl>
        </AccountGroupingRow>
      </InfoCard>

      {isChainIdUnsupported ? (
        <UnsupportedWalletBox>{UNSUPPORTED_WALLET_TEXT}</UnsupportedWalletBox>
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
