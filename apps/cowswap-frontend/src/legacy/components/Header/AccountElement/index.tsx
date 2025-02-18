import { useState } from 'react'

import { useNativeCurrencyAmount } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import ReactDOM from 'react-dom'

import { upToLarge, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { useToggleAccountModal } from 'modules/account'
import { clickNotifications } from 'modules/analytics'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { NotificationBell, NotificationSidebar } from 'modules/notifications'
import { useUnreadNotifications } from 'modules/notifications/hooks/useUnreadNotifications'
import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { BalanceText, Wrapper, LeftGroup } from './styled'

import { NetworkSelector } from '../NetworkSelector'

interface AccountElementProps {
  pendingActivities: string[]
  className?: string
}

export function AccountElement({ className, pendingActivities }: AccountElementProps) {
  const { account, chainId } = useWalletInfo()
  const isInjectedWidgetMode = isInjectedWidget()
  const { standaloneMode, hideNetworkSelector } = useInjectedWidgetParams()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const userEthBalance = useNativeCurrencyAmount(chainId, account)
  const toggleAccountModal = useToggleAccountModal()
  const nativeTokenSymbol = NATIVE_CURRENCIES[chainId].symbol
  const isUpToLarge = useMediaQuery(upToLarge)

  const unreadNotifications = useUnreadNotifications()
  const unreadNotificationsCount = Object.keys(unreadNotifications).length

  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const showEthBalance =
    account &&
    chainId &&
    !isChainIdUnsupported &&
    standaloneMode !== false &&
    !isInjectedWidgetMode &&
    userEthBalance &&
    !isUpToLarge

  return (
    <>
      <Wrapper className={className}>
        <LeftGroup active={!!account}>
          {showEthBalance && (
            <BalanceText>
              <TokenAmount amount={userEthBalance} tokenSymbol={{ symbol: nativeTokenSymbol }} />
            </BalanceText>
          )}
          <Web3Status pendingActivities={pendingActivities} onClick={() => account && toggleAccountModal()} />
          {account && (
            <NotificationBell
              unreadCount={unreadNotificationsCount}
              onClick={() => {
                clickNotifications(
                  unreadNotificationsCount === 0 ? 'click-bell' : 'click-bell-with-pending-notifications',
                )
                setSidebarOpen(true)
              }}
            />
          )}
        </LeftGroup>

        {!hideNetworkSelector && <NetworkSelector />}
      </Wrapper>

      {ReactDOM.createPortal(
        <NotificationSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />,
        document.body,
      )}
    </>
  )
}
