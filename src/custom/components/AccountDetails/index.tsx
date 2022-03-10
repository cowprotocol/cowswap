import React, { Fragment } from 'react'

import { useActiveWeb3React } from 'hooks/web3'
import { getExplorerLabel, shortenAddress } from 'utils'

import Copy from 'components/Copy'
import { Trans } from '@lingui/macro'

import { SUPPORTED_WALLETS, STORAGE_KEY_LAST_PROVIDER } from 'constants/index'
import { getEtherscanLink } from 'utils'
import { injected, walletconnect, walletlink, fortmatic, portis, WalletProvider } from 'connectors'
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg'
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg'
import FortmaticIcon from 'assets/images/fortmaticIcon.png'
import PortisIcon from 'assets/images/portisIcon.png'
import Identicon from 'components/Identicon'
import { NETWORK_LABELS } from 'components/Header'
import {
  WalletName,
  MainWalletAction,
  WalletAction,
  AccountControl,
  AddressLink,
  IconWrapper,
  renderActivities,
} from './AccountDetailsMod'
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
} from './styled'
import { ConnectedWalletInfo, useWalletInfo } from 'hooks/useWalletInfo'
import { MouseoverTooltip } from 'components/Tooltip'
import { supportedChainId } from 'utils/supportedChainId'
import { groupActivitiesByDay, useMultipleActivityDescriptors } from 'hooks/useRecentActivity'
import { CreationDateText } from 'components/AccountDetails/Transaction/styled'
import { ExternalLink } from 'theme'
import { getExplorerAddressLink } from 'utils/explorer'

const DATE_FORMAT_OPTION: Intl.DateTimeFormatOptions = {
  dateStyle: 'long',
}

type AbstractConnector = Pick<ReturnType<typeof useActiveWeb3React>, 'connector'>['connector']

function getWalletName(connector?: AbstractConnector): string {
  const { ethereum } = window
  const isMetaMask = !!(ethereum && ethereum.isMetaMask)

  const walletTuple = Object.entries(SUPPORTED_WALLETS).filter(
    ([walletType, { connector: walletConnector }]) =>
      walletConnector === connector && (connector !== injected || isMetaMask === (walletType === 'METAMASK'))
  )
  return walletTuple[0]?.[1]?.name || 'Unknown wallet'
}

export function formatConnectorName(connector?: AbstractConnector, walletInfo?: ConnectedWalletInfo) {
  const name = walletInfo?.walletName || getWalletName(connector)
  // In case the wallet is connected via WalletConnect and has wallet name set, add the suffix to be clear
  // This to avoid confusion for instance when using Metamask mobile
  // When name is not set, it defaults to WalletConnect already
  const walletConnectSuffix =
    walletInfo?.provider === WalletProvider.WALLET_CONNECT && walletInfo?.walletName ? ' (via WalletConnect)' : ''

  return (
    <WalletName>
      Connected with {name} {walletConnectSuffix}
    </WalletName>
  )
}

// TODO: look into StatusIcon.tsx, could be re-used here

export function getStatusIcon(connector?: AbstractConnector, walletInfo?: ConnectedWalletInfo, size?: number) {
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
  } else if (connector === injected) {
    return <Identicon size={size} />
  } else if (connector === walletconnect) {
    return (
      <IconWrapper size={16}>
        <img src={WalletConnectIcon} alt={'wallet connect logo'} />
      </IconWrapper>
    )
  } else if (connector === walletlink) {
    return (
      <IconWrapper size={16}>
        <img src={CoinbaseWalletIcon} alt={'coinbase wallet logo'} />
      </IconWrapper>
    )
  } else if (connector === fortmatic) {
    return (
      <IconWrapper size={16}>
        <img src={FortmaticIcon} alt={'fortmatic logo'} />
      </IconWrapper>
    )
  } else if (connector === portis) {
    return (
      <>
        <IconWrapper size={16}>
          <img src={PortisIcon} alt={'portis logo'} />
          <MainWalletAction
            onClick={() => {
              portis.portis.showPortis()
            }}
          >
            Show Portis
          </MainWalletAction>
        </IconWrapper>
      </>
    )
  }
  return null
}

interface AccountDetailsProps {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  toggleWalletModal: () => void
  closeOrdersPanel: () => void
}

export default function AccountDetails({
  pendingTransactions = [],
  confirmedTransactions = [],
  ENSName,
  toggleWalletModal,
  closeOrdersPanel,
}: AccountDetailsProps) {
  const { account, connector, chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId)
  const walletInfo = useWalletInfo()

  const explorerOrdersLink = account && connectedChainId && getExplorerAddressLink(connectedChainId, account)
  const explorerLabel = chainId && account ? getExplorerLabel(chainId, account, 'address') : undefined

  const activities =
    useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) }) || []
  const activitiesGroupedByDate = groupActivitiesByDay(activities)
  const activityTotalCount = activities?.length || 0

  const handleDisconnectClick = () => {
    ;(connector as any).close()
    localStorage.removeItem(STORAGE_KEY_LAST_PROVIDER)
    closeOrdersPanel()
    toggleWalletModal()
  }

  return (
    <Wrapper>
      <InfoCard>
        <AccountGroupingRow id="web3-account-identifier-row">
          <AccountControl>
            <WalletWrapper>
              {getStatusIcon(connector, walletInfo)}

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
              {formatConnectorName(connector, walletInfo)}
            </WalletActions>
          </AccountControl>
        </AccountGroupingRow>
        <AccountGroupingRow>
          <AccountControl>
            <WalletSecondaryActions>
              {connector !== injected && connector !== walletlink && (
                <WalletAction onClick={handleDisconnectClick}>
                  <Trans>Disconnect</Trans>
                </WalletAction>
              )}
              <WalletAction onClick={toggleWalletModal}>
                <Trans>Change Wallet</Trans>
              </WalletAction>
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

      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
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
          <NoActivityMessage>Your activity will appear here...</NoActivityMessage>
        </LowerSection>
      )}
    </Wrapper>
  )
}
