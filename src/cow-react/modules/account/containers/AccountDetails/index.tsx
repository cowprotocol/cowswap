import { Fragment } from 'react'

import { useWeb3React } from '@web3-react/core'
import { getExplorerLabel, shortenAddress } from 'utils'

import Copy from 'components/Copy'
import { updateSelectedWallet } from 'state/user/reducer'
import { useAppDispatch } from 'state/hooks'
import { Trans } from '@lingui/macro'

import { getEtherscanLink } from 'utils'
import {
  getConnection,
  getConnectionName,
  getIsMetaMask,
  getIsCoinbaseWallet,
} from '@cow/modules/wallet/api/utils/index'
import CoinbaseWalletIcon from '@cow/modules/wallet/api/assets/coinbase.svg'
import WalletConnectIcon from '@cow/modules/wallet/api/assets/walletConnectIcon.svg'
import FortmaticIcon from '@cow/modules/wallet/api/assets/formatic.png'
import Identicon from 'components/Identicon'
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
import { ConnectedWalletInfo, useWalletInfo } from '@cow/modules/wallet'
import { MouseoverTooltip } from 'components/Tooltip'
import { supportedChainId } from 'utils/supportedChainId'
import { groupActivitiesByDay, useMultipleActivityDescriptors } from 'hooks/useRecentActivity'
import { CreationDateText } from '../Transaction/styled'
import { ExternalLink } from 'theme'
import { getExplorerAddressLink } from 'utils/explorer'
import { Connector } from '@web3-react/types'
import {
  coinbaseWalletConnection,
  ConnectionType,
  fortmaticConnection,
  injectedConnection,
  walletConnectConnection,
} from 'connection'
import { isMobile } from 'utils/userAgent'
import UnsupporthedNetworkMessage from 'components/UnsupportedNetworkMessage'
import { SupportedChainId as ChainId } from 'constants/chains'

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

export function getStatusIcon(connector?: Connector | ConnectionType, walletInfo?: ConnectedWalletInfo, size?: number) {
  if (!connector) {
    return null
  }

  const connectionType = getConnection(connector)

  if (walletInfo && !walletInfo.isSupportedWallet) {
    /* eslint-disable jsx-a11y/accessible-emoji */
    return (
      <MouseoverTooltip text="This wallet is not yet supported">
        <IconWrapper role="img" aria-label="Warning sign. Wallet not supported">
          ⚠️
        </IconWrapper>
      </MouseoverTooltip>
    )
    /* eslint-enable jsx-a11y/accessible-emoji */
  } else if (walletInfo?.icon) {
    return (
      <IconWrapper size={16}>
        <img src={walletInfo.icon} alt={`${walletInfo?.walletName || 'wallet'} logo`} />
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
  const { account, connector, chainId: connectedChainId } = useWeb3React()
  const connection = getConnection(connector)
  const chainId = supportedChainId(connectedChainId)
  const walletInfo = useWalletInfo()

  const explorerOrdersLink = account && chainId && getExplorerAddressLink(chainId, account)
  const explorerLabel = chainId && account ? getExplorerLabel(chainId, account, 'address') : undefined

  const activities =
    useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) }) || []
  const activitiesGroupedByDate = groupActivitiesByDay(activities)
  const activityTotalCount = activities?.length || 0

  const dispatch = useAppDispatch()

  const isMetaMask = getIsMetaMask()
  const isCoinbaseWallet = getIsCoinbaseWallet()
  const isInjectedMobileBrowser = (isMetaMask || isCoinbaseWallet) && isMobile

  function formatConnectorName() {
    const name = walletInfo?.walletName || getConnectionName(connection.type, getIsMetaMask())
    // In case the wallet is connected via WalletConnect and has wallet name set, add the suffix to be clear
    // This to avoid confusion for instance when using Metamask mobile
    // When name is not set, it defaults to WalletConnect already
    const walletConnectSuffix =
      getConnection(connector) === walletConnectConnection && walletInfo?.walletName ? ' (via WalletConnect)' : ''

    return (
      <WalletName>
        <Trans>Connected with</Trans> {name} {walletConnectSuffix}
      </WalletName>
    )
  }

  const handleDisconnectClick = () => {
    if (connector.deactivate) {
      connector.deactivate()
    } else {
      connector.resetState()
    }
    dispatch(updateSelectedWallet({ wallet: undefined }))
    handleCloseOrdersPanel()
    toggleWalletModal()
  }

  return (
    <Wrapper>
      <InfoCard>
        <AccountGroupingRow id="web3-account-identifier-row">
          <AccountControl>
            <WalletWrapper>
              {getStatusIcon(connector, walletInfo, 24)}

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
