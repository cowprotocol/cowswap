import { Fragment } from 'react'

import { getExplorerLabel, shortenAddress } from 'utils'

import Copy from 'components/Copy'
import { Trans } from '@lingui/macro'

import { getEtherscanLink } from 'utils'
import { getWeb3ReactConnection } from '@cow/modules/wallet/web3-react/connection'
import CoinbaseWalletIcon from '@cow/modules/wallet/api/assets/coinbase.svg'
import WalletConnectIcon from '@cow/modules/wallet/api/assets/walletConnectIcon.svg'
import FortmaticIcon from '@cow/modules/wallet/api/assets/formatic.png'
import LedgerIcon from '@cow/modules/wallet/api/assets/ledger.svg'
import { Identicon } from '@cow/modules/wallet/api/container/Identicon'
import { ActivityDescriptors } from 'hooks/useRecentActivity'
import Activity from '@cow/modules/account/containers/Transaction'

import {
  NetworkCard,
  Wrapper,
  InfoCard,
  AccountGroupingRow,
  NoActivityMessage,
  LowerSection,
  WalletActions,
  WalletSecondaryActions,
  WalletNameAddress,
  WalletWrapper,
  WalletName,
  WalletAction,
  AccountControl,
  AddressLink,
  IconWrapper,
  TransactionListWrapper,
} from './styled'
import { MouseoverTooltip } from 'components/Tooltip'
import { supportedChainId } from 'utils/supportedChainId'
import { groupActivitiesByDay, useMultipleActivityDescriptors } from 'hooks/useRecentActivity'
import { CreationDateText } from '../Transaction/styled'
import { ExternalLink } from 'theme'
import { getExplorerAddressLink } from 'utils/explorer'
import { Connector } from '@web3-react/types'
import { ConnectionType, useWalletInfo, WalletDetails } from '@cow/modules/wallet'
import { isMobile } from 'utils/userAgent'
import UnsupporthedNetworkMessage from 'components/UnsupportedNetworkMessage'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useDisconnectWallet } from '@cow/modules/wallet'
import { getConnectionName, getIsCoinbaseWallet, getIsMetaMask } from '@cow/modules/wallet/api/utils/connection'
import { injectedConnection } from '@cow/modules/wallet/web3-react/connection/injected'
import { walletConnectConnection } from '@cow/modules/wallet/web3-react/connection/walletConnect'
import { coinbaseWalletConnection } from '@cow/modules/wallet/web3-react/connection/coinbase'
import { fortmaticConnection } from '@cow/modules/wallet/web3-react/connection/formatic'
import { useWalletDetails } from '@cow/modules/wallet/api/hooks'
import { useWeb3React } from '@web3-react/core'
import { ledgerConnection } from '@cow/modules/wallet/web3-react/connection/ledger'

export const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  // [ChainId.RINKEBY]: 'Rinkeby',
  // [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GOERLI]: 'Görli',
  // [ChainId.KOVAN]: 'Kovan',
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

export function getStatusIcon(connector?: Connector | ConnectionType, walletDetails?: WalletDetails, size?: number) {
  if (!connector) {
    return null
  }

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
  } else if (walletDetails?.icon) {
    return (
      <IconWrapper size={16}>
        <img src={walletDetails.icon} alt={`${walletDetails?.walletName || 'wallet'} logo`} />
      </IconWrapper>
    )
  } else if (connectionType === injectedConnection) {
    return <Identicon size={size} />
  } else if (connectionType === walletConnectConnection) {
    return (
      <IconWrapper size={16}>
        <img src={WalletConnectIcon} alt={'wallet connect logo'} />
      </IconWrapper>
    )
  } else if (connectionType === coinbaseWalletConnection) {
    return (
      <IconWrapper size={16}>
        <img src={CoinbaseWalletIcon} alt={'coinbase wallet logo'} />
      </IconWrapper>
    )
  } else if (connectionType === fortmaticConnection) {
    return (
      <IconWrapper size={16}>
        <img src={FortmaticIcon} alt={'fortmatic logo'} />
      </IconWrapper>
    )
  } else if (connectionType === ledgerConnection) {
    return (
      <IconWrapper size={16}>
        <img src={LedgerIcon} alt={'ledger logo'} />
      </IconWrapper>
    )
  }
  return null
}

export interface AccountDetailsProps {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  toggleWalletModal: () => void
  handleCloseOrdersPanel: () => void
}

export function AccountDetails({
  pendingTransactions = [],
  confirmedTransactions = [],
  ENSName,
  toggleWalletModal,
  handleCloseOrdersPanel,
}: AccountDetailsProps) {
  const { account, chainId: connectedChainId } = useWalletInfo()
  const { connector } = useWeb3React()
  const connection = getWeb3ReactConnection(connector)
  const chainId = supportedChainId(connectedChainId)
  const walletDetails = useWalletDetails()
  const disconnectWallet = useDisconnectWallet()

  const explorerOrdersLink = account && chainId && getExplorerAddressLink(chainId, account)
  const explorerLabel = chainId && account ? getExplorerLabel(chainId, account, 'address') : undefined

  const activities =
    useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) }) || []
  const activitiesGroupedByDate = groupActivitiesByDay(activities)
  const activityTotalCount = activities?.length || 0

  const isMetaMask = getIsMetaMask()
  const isCoinbaseWallet = getIsCoinbaseWallet()
  const isInjectedMobileBrowser = (isMetaMask || isCoinbaseWallet) && isMobile

  function formatConnectorName() {
    const name = walletDetails?.walletName || getConnectionName(connection.type, getIsMetaMask())
    // In case the wallet is connected via WalletConnect and has wallet name set, add the suffix to be clear
    // This to avoid confusion for instance when using Metamask mobile
    // When name is not set, it defaults to WalletConnect already
    const walletConnectSuffix =
      getWeb3ReactConnection(connector) === walletConnectConnection && walletDetails?.walletName
        ? ' (via WalletConnect)'
        : ''

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

  return (
    <Wrapper>
      <InfoCard>
        <AccountGroupingRow id="web3-account-identifier-row">
          <AccountControl>
            <WalletWrapper>
              {getStatusIcon(connector, walletDetails, 24)}

              {(ENSName || account) && (
                <Copy toCopy={ENSName ? ENSName : account ? account : ''}>
                  <WalletNameAddress>{ENSName ? ENSName : account && shortenAddress(account)}</WalletNameAddress>
                </Copy>
              )}
            </WalletWrapper>

            <WalletActions>
              {' '}
              {chainId && NETWORK_LABELS[chainId] && (
                <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
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
                  <WalletAction onClick={handleDisconnectClick}>
                    <Trans>Disconnect</Trans>
                  </WalletAction>

                  {connection.type !== ConnectionType.GNOSIS_SAFE && (
                    <WalletAction onClick={toggleWalletModal}>
                      <Trans>Change Wallet</Trans>
                    </WalletAction>
                  )}
                </>
              )}

              {chainId && account && (
                <AddressLink
                  hasENS={!!ENSName}
                  isENS={!!ENSName}
                  href={getEtherscanLink(chainId, ENSName ? ENSName : account, 'address')}
                >
                  {explorerLabel} ↗
                </AddressLink>
              )}
            </WalletSecondaryActions>
          </AccountControl>
        </AccountGroupingRow>
      </InfoCard>

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
            {chainId ? <span>Your activity will appear here...</span> : <UnsupporthedNetworkMessage />}
          </NoActivityMessage>
        </LowerSection>
      )}
    </Wrapper>
  )
}
