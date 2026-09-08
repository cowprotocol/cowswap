import { ReactNode, useCallback, useRef } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useToggleAccountModal } from 'modules/account'
import { AffiliateTraderHeaderButton, useShouldShowAffiliateTraderHeaderButton } from 'modules/affiliate'
import {
  NotificationBell,
  NotificationSidebar,
  useCloseNotificationSidebar,
  useHasNotificationSubscription,
  useNotificationAlertDismissal,
  useNotificationSidebarState,
  useOpenNotificationSidebar,
  useUnreadSidebarNotificationsCount,
} from 'modules/notifications'
import { WalletStatusButton } from 'modules/wallet'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import { Wrapper } from './AccountElement.styled'

import { NotificationAlertPopover } from '../NotificationAlertPopover/NotificationAlertPopover.pure'

interface AccountElementProps {
  className?: string
}

export function AccountElement({ className }: AccountElementProps): ReactNode {
  const { account } = useWalletInfo()
  const toggleAccountModal = useToggleAccountModal()
  const shouldShowAffiliateTraderHeaderButton = useShouldShowAffiliateTraderHeaderButton()
  const unreadNotificationsCount = useUnreadSidebarNotificationsCount()
  const { isDismissed, dismiss } = useNotificationAlertDismissal()
  const { areTelegramNotificationsEnabled } = useFeatureFlags()
  const { hasSubscription, isLoading } = useHasNotificationSubscription()

  const { isOpen: isSidebarOpen, initialSettingsOpen: shouldOpenSettings } = useNotificationSidebarState()
  const openNotificationSidebar = useOpenNotificationSidebar()
  const closeNotificationSidebar = useCloseNotificationSidebar()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const notificationBellRef = useRef<HTMLButtonElement>(null)

  const shouldShowPopover =
    areTelegramNotificationsEnabled && !!account && !isDismissed && !hasSubscription && !isLoading

  const handleEnableAlerts = (): void => {
    openNotificationSidebar(areTelegramNotificationsEnabled)
    dismiss()
  }

  const handleBellClick = useCallback(() => {
    if (shouldShowPopover) {
      dismiss()
    }
    openNotificationSidebar()
  }, [shouldShowPopover, dismiss, openNotificationSidebar])

  return (
    <>
      <Wrapper className={className} active={!!account} ref={wrapperRef}>
        <AffiliateTraderHeaderButton />
        <WalletStatusButton
          variant={shouldShowAffiliateTraderHeaderButton ? 'navBarAffiliate' : 'navBarDefault'}
          onWalletClick={toggleAccountModal}
        />
        {account && (
          <NotificationAlertPopover
            show={shouldShowPopover}
            onEnableAlerts={handleEnableAlerts}
            onDismiss={dismiss}
            containerRef={wrapperRef}
          >
            <NotificationBell
              ref={notificationBellRef}
              unreadCount={unreadNotificationsCount}
              data-click-event={createNotificationClickEventData(
                unreadNotificationsCount === 0 ? 'click-bell' : 'click-bell-with-pending-notifications',
              )}
              onClick={handleBellClick}
            />
          </NotificationAlertPopover>
        )}
      </Wrapper>

      <NotificationSidebar
        isOpen={isSidebarOpen}
        onClose={closeNotificationSidebar}
        initialSettingsOpen={shouldOpenSettings}
      />
    </>
  )
}

function createNotificationClickEventData(event: string): string {
  return toCowSwapGtmEvent({
    category: CowSwapAnalyticsCategory.NOTIFICATIONS,
    action: event,
  })
}
