import { Fragment, ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { styled } from '@cowprotocol/common-hooks'
import { getEtherscanLink, getExplorerAddressLink, getExplorerLabel, shortenAddress } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { ExternalLink } from '@cowprotocol/ui'
import {
  ConnectionType,
  getIsHardWareWallet,
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

import Copy from 'legacy/components/Copy'
import { groupActivitiesByDay, useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { useAppDispatch } from 'legacy/state/hooks'
import { updateSelectedWallet } from 'legacy/state/user/reducer'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { UnsupportedNetworksText } from 'common/pure/UnsupportedNetworksText'

import { AccountIcon } from './AccountIcon'
import { ActivitiesList } from './ActivitiesList'
import {
  AccountControl,
  AccountGroupingRow,
  AddressLink,
  InfoCard,
  LowerSection,
  NetworkCard,
  NoActivityMessage,
  UnsupportedWalletBox,
  WalletAction,
  WalletActions,
  WalletName,
  WalletNameAddress,
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
  margin-top: 10px;
`

export const DATE_FORMAT_OPTION: Intl.DateTimeFormatOptions = {
  dateStyle: 'long',
}

export interface AccountDetailsProps {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  forceHardwareWallet?: boolean
  toggleAccountSelectorModal: Command
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
  toggleAccountSelectorModal,
  handleCloseOrdersPanel,
  forceHardwareWallet,
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

  const handleDisconnectClick = (): void => {
    disconnectWallet()
    handleCloseOrdersPanel()
    dispatch(updateSelectedWallet({ wallet: undefined }))
  }

  const networkLabel = CHAIN_INFO[chainId].label
  const isHardWareWallet = forceHardwareWallet || getIsHardWareWallet(connectionType)

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
                <AccountIcon size={24} account={account} />

                {(ENSName || account) && (
                  <WalletNameAddress>{ENSName ? ENSName : account && shortenAddress(account)}</WalletNameAddress>
                )}
              </WalletSelector>

              {(ENSName || account) && <Copy toCopy={ENSName ? ENSName : account ? account : ''} />}
            </WalletWrapper>

            <WalletActions>
              {' '}
              {!isChainIdUnsupported && <NetworkCard title={networkLabel}>{networkLabel}</NetworkCard>}{' '}
              <WalletName>
                <Trans>Connected with</Trans> {walletDetails?.walletName} {walletConnectSuffix}
              </WalletName>
            </WalletActions>

            <CowShedInfoStyled onClick={closeAccountModal} />
          </AccountControl>
        </AccountGroupingRow>
        <AccountGroupingRow>
          <AccountControl>
            <WalletSecondaryActions>
              {!isInjectedMobileBrowser && account && !isChainIdUnsupported && (
                <AddressLink
                  hasENS={!!ENSName}
                  isENS={!!ENSName}
                  href={getEtherscanLink(chainId, 'address', ENSName ? ENSName : account)}
                >
                  {explorerLabel} ↗
                </AddressLink>
              )}

              {standaloneMode !== false && connectionType !== ConnectionType.GNOSIS_SAFE && (
                <WalletAction onClick={handleDisconnectClick}>
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
