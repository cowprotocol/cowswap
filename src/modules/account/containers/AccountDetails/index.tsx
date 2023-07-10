import { Fragment } from 'react'

import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { Trans } from '@lingui/macro'

import Copy from 'legacy/components/Copy'
import { MouseoverTooltip } from 'legacy/components/Tooltip'
import UnsupporthedNetworkMessage from 'legacy/components/UnsupportedNetworkMessage'
import {
  ActivityDescriptors,
  groupActivitiesByDay,
  useMultipleActivityDescriptors,
} from 'legacy/hooks/useRecentActivity'
import { ExternalLink } from 'legacy/theme'
import { getEtherscanLink, getExplorerLabel, shortenAddress } from 'legacy/utils'
import { getExplorerAddressLink } from 'legacy/utils/explorer'
import { supportedChainId } from 'legacy/utils/supportedChainId'
import { isMobile } from 'legacy/utils/userAgent'

import Activity from 'modules/account/containers/Transaction'
import { ConnectionType, useDisconnectWallet, useWalletInfo, WalletDetails } from 'modules/wallet'
import CoinbaseWalletIcon from 'modules/wallet/api/assets/coinbase.svg'
import FortmaticIcon from 'modules/wallet/api/assets/formatic.png'
import KeystoneImage from 'modules/wallet/api/assets/keystone.svg'
import LedgerIcon from 'modules/wallet/api/assets/ledger.svg'
import TallyIcon from 'modules/wallet/api/assets/tally.svg'
import TrustIcon from 'modules/wallet/api/assets/trust.svg'
import WalletConnectIcon from 'modules/wallet/api/assets/walletConnectIcon.svg'
import { Identicon } from 'modules/wallet/api/container/Identicon'
import { useWalletDetails } from 'modules/wallet/api/hooks'
import {
  getConnectionName,
  getIsCoinbaseWallet,
  getIsMetaMask,
  getIsTrustWallet,
} from 'modules/wallet/api/utils/connection'
import { getWeb3ReactConnection } from 'modules/wallet/web3-react/connection'
import { coinbaseWalletConnection } from 'modules/wallet/web3-react/connection/coinbase'
import { fortmaticConnection } from 'modules/wallet/web3-react/connection/formatic'
import { injectedConnection } from 'modules/wallet/web3-react/connection/injected'
import { keystoneConnection } from 'modules/wallet/web3-react/connection/keystone'
import { ledgerConnection } from 'modules/wallet/web3-react/connection/ledger'
import { tallyWalletConnection } from 'modules/wallet/web3-react/connection/tally'
import { trustWalletConnection } from 'modules/wallet/web3-react/connection/trust'
import { walletConnectConnection } from 'modules/wallet/web3-react/connection/walletConnect'
import { walletConnectConnectionV2 } from 'modules/wallet/web3-react/connection/walletConnectV2'

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
  WalletAction,
  WalletActions,
  WalletName,
  WalletNameAddress,
  WalletSecondaryActions,
  WalletWrapper,
  Wrapper,
} from './styled'
import { SurplusCard } from './SurplusCard'

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
  } else if (connectionType === coinbaseWalletConnection) {
    return (
      <IconWrapper size={16}>
        <img src={CoinbaseWalletIcon} alt={'Coinbase wallet logo'} />
      </IconWrapper>
    )
  } else if (connectionType === fortmaticConnection) {
    return (
      <IconWrapper size={16}>
        <img src={FortmaticIcon} alt={'Fortmatic logo'} />
      </IconWrapper>
    )
  } else if (connectionType === tallyWalletConnection) {
    return (
      <IconWrapper size={16}>
        <img src={TallyIcon} alt={'Tally logo'} />
      </IconWrapper>
    )
  } else if (connectionType === trustWalletConnection || getIsTrustWallet(null, walletDetails?.walletName)) {
    return (
      <IconWrapper size={16}>
        <img src={TrustIcon} alt={'Trust logo'} />
      </IconWrapper>
    )
  } else if (connectionType === tallyWalletConnection) {
    return (
      <IconWrapper size={16}>
        <img src={TallyIcon} alt={'tally logo'} />
      </IconWrapper>
    )
  } else if (connectionType === ledgerConnection) {
    return (
      <IconWrapper size={16}>
        <img src={LedgerIcon} alt={'Ledger logo'} />
      </IconWrapper>
    )
  } else if (connectionType === keystoneConnection) {
    return (
      <IconWrapper size={16}>
        <img src={KeystoneImage} alt={'Keystone logo'} />
      </IconWrapper>
    )
  } else if (connectionType === walletConnectConnection) {
    return (
      <IconWrapper size={16}>
        <img src={WalletConnectIcon} alt={'Wallet connect logo'} />
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
  const explorerLabel = chainId && account ? getExplorerLabel(chainId, 'address', account) : undefined

  const activities = useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) })
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
    const connectionType = getWeb3ReactConnection(connector)
    const isWalletConnect = connectionType === walletConnectConnection || connectionType === walletConnectConnectionV2
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
                  href={getEtherscanLink(chainId, 'address', ENSName ? ENSName : account)}
                >
                  {explorerLabel} ↗
                </AddressLink>
              )}
            </WalletSecondaryActions>
          </AccountControl>
        </AccountGroupingRow>
      </InfoCard>

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
            {chainId ? <span>Your activity will appear here...</span> : <UnsupporthedNetworkMessage />}
          </NoActivityMessage>
        </LowerSection>
      )}
    </Wrapper>
  )
}
