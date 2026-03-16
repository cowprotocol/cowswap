import { ReactNode, useCallback, useRef, useState } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import ReactDOM from 'react-dom'

import { useToggleAccountModal } from 'modules/account'
import {
  NotificationBell,
  NotificationSidebar,
  useHasNotificationSubscription,
  useNotificationAlertDismissal,
  useUnreadSidebarNotificationsCount,
} from 'modules/notifications'
import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import { NotificationAlertPopover } from './NotificationAlertPopover'
import { Wrapper } from './styled'

interface AccountElementProps {
  className?: string
}

interface NotificationSidebarPortalProps {
  portalTarget: HTMLElement | null
  isSidebarOpen: boolean
  onClose: () => void
  initialSettingsOpen: boolean
}

export function AccountElement({ className }: AccountElementProps): ReactNode {
  const { account } = useWalletInfo()
  const toggleAccountModal = useToggleAccountModal()
  const unreadNotificationsCount = useUnreadSidebarNotificationsCount()
  const { isDismissed, dismiss } = useNotificationAlertDismissal()
  const { areTelegramNotificationsEnabled } = useFeatureFlags()
  const { hasSubscription, isLoading } = useHasNotificationSubscription()

  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [shouldOpenSettings, setShouldOpenSettings] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

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

  const portalTarget = typeof document !== 'undefined' ? document.body : null

  return (
    <>
      <Wrapper className={className} active={!!account} ref={wrapperRef}>
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
              onClick={handleBellClick}
            />
          </NotificationAlertPopover>
        )}
      </Wrapper>

      <NotificationSidebarPortal
        portalTarget={portalTarget}
        isSidebarOpen={isSidebarOpen}
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

function NotificationSidebarPortal({
  portalTarget,
  isSidebarOpen,
  onClose,
  initialSettingsOpen,
}: NotificationSidebarPortalProps): ReactNode {
  if (!portalTarget) return null

  return ReactDOM.createPortal(
    <NotificationSidebar isOpen={isSidebarOpen} onClose={onClose} initialSettingsOpen={initialSettingsOpen} />,
    portalTarget,
  )
}
