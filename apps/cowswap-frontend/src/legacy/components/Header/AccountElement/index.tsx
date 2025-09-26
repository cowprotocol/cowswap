import { ReactNode, useRef, useState } from 'react'

import { useNativeCurrencyAmount } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import ReactDOM from 'react-dom'

import { upToLarge, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { useToggleAccountModal } from 'modules/account'
import { NotificationBell, NotificationSidebar } from 'modules/notifications'
import { useHasNotificationSubscription } from 'modules/notifications/hooks/useHasNotificationSubscription'
import { useNotificationAlertDismissal } from 'modules/notifications/hooks/useNotificationAlertDismissal'
import { useUnreadNotifications } from 'modules/notifications/hooks/useUnreadNotifications'
import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { NotificationAlertPopover } from './NotificationAlertPopover'
import { BalanceText, Wrapper } from './styled'

function createNotificationClickEventData(event: string): string {
  return toCowSwapGtmEvent({
    category: CowSwapAnalyticsCategory.NOTIFICATIONS,
    action: event,
  })
}

interface AccountElementProps {
  standaloneMode?: boolean
  className?: string
}

export function AccountElement({ className, standaloneMode }: AccountElementProps): ReactNode {
  const { account, chainId } = useWalletInfo()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const userEthBalance = useNativeCurrencyAmount(chainId, account)
  const toggleAccountModal = useToggleAccountModal()
  const nativeTokenSymbol = NATIVE_CURRENCIES[chainId].symbol
  const isUpToLarge = useMediaQuery(upToLarge)

  const unreadNotifications = useUnreadNotifications()
  const unreadNotificationsCount = Object.keys(unreadNotifications).length

  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [shouldOpenSettings, setShouldOpenSettings] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { isDismissed, dismiss } = useNotificationAlertDismissal()
  const { areTelegramNotificationsEnabled } = useFeatureFlags()
  const { hasSubscription, isLoading } = useHasNotificationSubscription()
  const shouldShowPopover =
    areTelegramNotificationsEnabled && !!account && !isDismissed && !hasSubscription && !isLoading

  const handleEnableAlerts = (): void => {
    setShouldOpenSettings(areTelegramNotificationsEnabled)
    setSidebarOpen(true)
    dismiss()
  }

  return (
    <>
      <Wrapper className={className} active={!!account} ref={wrapperRef}>
        {standaloneMode !== false && account && !isChainIdUnsupported && userEthBalance && chainId && !isUpToLarge && (
          <BalanceText>
            <TokenAmount amount={userEthBalance} tokenSymbol={{ symbol: nativeTokenSymbol }} />
          </BalanceText>
        )}
        <Web3Status onClick={() => account && toggleAccountModal()} />
        {account && (
          <NotificationAlertPopover
            show={shouldShowPopover}
            onEnableAlerts={handleEnableAlerts}
            onDismiss={dismiss}
            containerRef={wrapperRef}
          >
            <NotificationBell
              unreadCount={unreadNotificationsCount}
              data-click-event={createNotificationClickEventData(
                unreadNotificationsCount === 0 ? 'click-bell' : 'click-bell-with-pending-notifications',
              )}
              onClick={() => {
                if (shouldShowPopover) {
                  dismiss() // Dismiss popover if shown
                }
                setSidebarOpen(true) // Always open sidebar
              }}
            />
          </NotificationAlertPopover>
        )}
      </Wrapper>

      {ReactDOM.createPortal(
        <NotificationSidebar
          isOpen={isSidebarOpen}
          onClose={() => {
            setSidebarOpen(false)
            setShouldOpenSettings(false)
          }}
          initialSettingsOpen={shouldOpenSettings}
        />,
        document.body,
      )}
    </>
  )
}
