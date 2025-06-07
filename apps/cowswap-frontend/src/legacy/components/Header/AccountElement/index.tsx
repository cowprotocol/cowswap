import { useState } from 'react'

import { useNativeCurrencyAmount } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import ReactDOM from 'react-dom'

import { upToLarge, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { useToggleAccountModal } from 'modules/account'
import { NotificationBell, NotificationSidebar } from 'modules/notifications'
import { useUnreadNotifications } from 'modules/notifications/hooks/useUnreadNotifications'
import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { BalanceText, Wrapper } from './styled'

function createNotificationClickEventData(event: string): string {
  return toCowSwapGtmEvent({
    category: CowSwapAnalyticsCategory.NOTIFICATIONS,
    action: event,
  })
}

interface AccountElementProps {
  pendingActivities: string[]
  standaloneMode?: boolean
  className?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function AccountElement({ className, standaloneMode, pendingActivities }: AccountElementProps) {
  const { account, chainId } = useWalletInfo()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const userEthBalance = useNativeCurrencyAmount(chainId, account)
  const toggleAccountModal = useToggleAccountModal()
  const nativeTokenSymbol = NATIVE_CURRENCIES[chainId].symbol
  const isUpToLarge = useMediaQuery(upToLarge)

  const unreadNotifications = useUnreadNotifications()
  const unreadNotificationsCount = Object.keys(unreadNotifications).length

  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Wrapper className={className} active={!!account}>
        {standaloneMode !== false && account && !isChainIdUnsupported && userEthBalance && chainId && !isUpToLarge && (
          <BalanceText>
            <TokenAmount amount={userEthBalance} tokenSymbol={{ symbol: nativeTokenSymbol }} />
          </BalanceText>
        )}
        <Web3Status pendingActivities={pendingActivities} onClick={() => account && toggleAccountModal()} />
        {account && (
          <NotificationBell
            unreadCount={unreadNotificationsCount}
            data-click-event={createNotificationClickEventData(
              unreadNotificationsCount === 0 ? 'click-bell' : 'click-bell-with-pending-notifications',
            )}
            onClick={() => setSidebarOpen(true)}
          />
        )}
      </Wrapper>

      {ReactDOM.createPortal(
        <NotificationSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />,
        document.body,
      )}
    </>
  )
}
