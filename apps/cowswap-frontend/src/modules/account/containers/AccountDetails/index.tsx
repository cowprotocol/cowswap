import { Fragment, useMemo } from 'react'

import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useWeb3React } from '@web3-react/core'
import { Connector } from '@web3-react/types'

import { Trans } from '@lingui/macro'

import Copy from 'legacy/components/Copy'
import { MouseoverTooltip } from 'legacy/components/Tooltip'
import {
  ActivityDescriptors,
  groupActivitiesByDay,
  useMultipleActivityDescriptors,
} from 'legacy/hooks/useRecentActivity'
import { ExternalLink } from 'legacy/theme'
import { getEtherscanLink, getExplorerLabel, shortenAddress } from 'legacy/utils'
import { getExplorerAddressLink } from 'legacy/utils/explorer'
import { isMobile } from 'legacy/utils/userAgent'

import Activity from 'modules/account/containers/Transaction'
import { ConnectionType, useDisconnectWallet, useWalletInfo, WalletDetails } from 'modules/wallet'
import { HwAccountIndexSelector } from 'modules/wallet'
import CoinbaseWalletIcon from 'modules/wallet/api/assets/coinbase.svg'
import FortmaticIcon from 'modules/wallet/api/assets/formatic.png'
import KeystoneImage from 'modules/wallet/api/assets/keystone.svg'
import LedgerIcon from 'modules/wallet/api/assets/ledger.svg'
import TallyIcon from 'modules/wallet/api/assets/tally.svg'
import TrezorIcon from 'modules/wallet/api/assets/trezor.svg'
import TrustIcon from 'modules/wallet/api/assets/trust.svg'
import WalletConnectIcon from 'modules/wallet/api/assets/walletConnectIcon.svg'
import { Identicon } from 'modules/wallet/api/container/Identicon'
import { useWalletDetails } from 'modules/wallet/api/hooks'
import { getConnectionName, getIsCoinbaseWallet, getIsMetaMask } from 'modules/wallet/api/utils/connection'
import { getIsHardWareWallet, getWeb3ReactConnection } from 'modules/wallet/web3-react/connection'
import { walletConnectConnection } from 'modules/wallet/web3-react/connection/walletConnect'
import { walletConnectConnectionV2 } from 'modules/wallet/web3-react/connection/walletConnectV2'

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

const IDENTICON_KEY = 'Identicon'

const walletIcons: Record<ConnectionType, 'Identicon' | string> = {
  [ConnectionType.INJECTED]: IDENTICON_KEY,
  [ConnectionType.INJECTED_WIDGET]: IDENTICON_KEY,
  [ConnectionType.GNOSIS_SAFE]: IDENTICON_KEY,
  [ConnectionType.NETWORK]: IDENTICON_KEY,
  [ConnectionType.ZENGO]: IDENTICON_KEY,
  [ConnectionType.AMBIRE]: IDENTICON_KEY,
  [ConnectionType.ALPHA]: IDENTICON_KEY,
  [ConnectionType.COINBASE_WALLET]: CoinbaseWalletIcon,
  [ConnectionType.FORTMATIC]: FortmaticIcon,
  [ConnectionType.TRUST]: TrustIcon,
  [ConnectionType.TALLY]: TallyIcon,
  [ConnectionType.LEDGER]: LedgerIcon,
  [ConnectionType.TREZOR]: TrezorIcon,
  [ConnectionType.KEYSTONE]: KeystoneImage,
  [ConnectionType.WALLET_CONNECT]: WalletConnectIcon,
  [ConnectionType.WALLET_CONNECT_V2]: WalletConnectIcon,
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

  const icon = walletIcons[connectionType.type]

  if (icon === IDENTICON_KEY) {
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
  const { account, chainId } = useWalletInfo()
  const { connector } = useWeb3React()
  const connection = getWeb3ReactConnection(connector)
  const walletDetails = useWalletDetails()
  const disconnectWallet = useDisconnectWallet()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()

  const explorerOrdersLink = account && getExplorerAddressLink(chainId, account)
  const explorerLabel = account ? getExplorerLabel(chainId, 'address', account) : undefined

  const activities = useMultipleActivityDescriptors({ chainId, ids: pendingTransactions.concat(confirmedTransactions) })
  const activitiesGroupedByDate = groupActivitiesByDay(activities)
  const activityTotalCount = activities?.length || 0

  const isMetaMask = getIsMetaMask()
  const isCoinbaseWallet = getIsCoinbaseWallet()
  const isInjectedMobileBrowser = (isMetaMask || isCoinbaseWallet) && isMobile

  const connectionType = useMemo(() => getWeb3ReactConnection(connector), [connector])

  function formatConnectorName() {
    const name = walletDetails?.walletName || getConnectionName(connection.type, getIsMetaMask())
    // In case the wallet is connected via WalletConnect and has wallet name set, add the suffix to be clear
    // This to avoid confusion for instance when using Metamask mobile
    // When name is not set, it defaults to WalletConnect already
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

  const networkLabel = NETWORK_LABELS[chainId]

  const isHardWareWallet = getIsHardWareWallet(connectionType.type)

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

            {isHardWareWallet && <HwAccountIndexSelector />}

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

              {account && !isChainIdUnsupported && (
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
