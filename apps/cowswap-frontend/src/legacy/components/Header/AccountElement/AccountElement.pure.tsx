import { ReactNode, useCallback, useRef, useState } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useToggleAccountModal } from 'modules/account'
import { AffiliateTraderHeaderButton, useShouldShowAffiliateTraderHeaderButton } from 'modules/affiliate'
import {
  NotificationBell,
  NotificationSidebar,
  useHasNotificationSubscription,
  useNotificationAlertDismissal,
  useUnreadSidebarNotificationsCount,
} from 'modules/notifications'
import { Web3Status } from 'modules/wallet'

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

  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [shouldOpenSettings, setShouldOpenSettings] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const notificationBellRef = useRef<HTMLButtonElement>(null)

  const shouldShowPopover =
    areTelegramNotificationsEnabled && !!account && !isDismissed && !hasSubscription && !isLoading

  const handleEnableAlerts = (): void => {
    setShouldOpenSettings(areTelegramNotificationsEnabled)
    setSidebarOpen(true)
    dismiss()
  }

  const handleBellClick = useCallback(() => {
    if (shouldShowPopover) {
      dismiss()
    }
    setSidebarOpen(true)
  }, [shouldShowPopover, dismiss])

  return (
    <>
      <Wrapper className={className} active={!!account} ref={wrapperRef}>
        <AffiliateTraderHeaderButton />
        <Web3Status
          joinedLeft={shouldShowAffiliateTraderHeaderButton}
          onClick={() => account && toggleAccountModal()}
        />
        {account && (
          <>
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
          </>
        )}
      </Wrapper>

      <NotificationSidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          setSidebarOpen(false)
          setShouldOpenSettings(false)
        }}
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
