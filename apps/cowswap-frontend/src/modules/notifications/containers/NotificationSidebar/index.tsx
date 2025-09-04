import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useOnClickOutside } from '@cowprotocol/common-hooks'

import { upToSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import { Sidebar, SidebarHeader, ArrowLeft, SettingsIcon, EnableAlertsButtonWithIcon } from './styled'

import { useHasNotificationSubscription } from '../../hooks/useHasNotificationSubscription'
import { NotificationSettings } from '../NotificationSettings'
import { NotificationsList } from '../NotificationsList'

interface SettingsHeaderProps {
  onBack: () => void
}

function SettingsHeader({ onBack }: SettingsHeaderProps): ReactNode {
  return (
    <SidebarHeader>
      <span>
        <ArrowLeft
          onClick={onBack}
          data-click-event={toCowSwapGtmEvent({
            category: CowSwapAnalyticsCategory.NOTIFICATIONS,
            action: 'Close notification settings',
          })}
        />
      </span>
      <h3>Trade alerts</h3>
    </SidebarHeader>
  )
}

interface NotificationsHeaderProps {
  isMobile: boolean
  areTelegramNotificationsEnabled: boolean
  hasSubscription: boolean
  onDismiss: () => void
  onToggleSettings: () => void
  onEnableAlerts: () => void
}

function NotificationsHeader({
  areTelegramNotificationsEnabled,
  hasSubscription,
  onDismiss,
  onToggleSettings,
  onEnableAlerts,
}: NotificationsHeaderProps): ReactNode {
  return (
    <SidebarHeader>
      <span>
        <ArrowLeft
          onClick={onDismiss}
          data-click-event={toCowSwapGtmEvent({
            category: CowSwapAnalyticsCategory.NOTIFICATIONS,
            action: 'Close notifications panel',
            label: 'mobile',
          })}
        />
      </span>
      <h3>Notifications</h3>
      {areTelegramNotificationsEnabled &&
        (hasSubscription ? (
          <SettingsIcon size={18} onClick={onToggleSettings} />
        ) : (
          <EnableAlertsButtonWithIcon
            onClick={onEnableAlerts}
            data-click-event={toCowSwapGtmEvent({
              category: CowSwapAnalyticsCategory.NOTIFICATIONS,
              action: 'Enable trade alerts',
              label: 'notification sidebar',
            })}
          />
        ))}
    </SidebarHeader>
  )
}

interface NotificationSidebarProps {
  isOpen: boolean
  onClose: () => void
  initialSettingsOpen?: boolean
}

export function NotificationSidebar({
  isOpen,
  onClose,
  initialSettingsOpen = false,
}: NotificationSidebarProps): ReactNode {
  const [isSettingsOpen, setIsSettingsOpen] = useState(initialSettingsOpen)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery(upToSmall)

  // const { areTelegramNotificationsEnabled } = useFeatureFlags()
  const areTelegramNotificationsEnabled = true // HARDCODE TRUE FOR NOW
  const { hasSubscription } = useHasNotificationSubscription()

  // Sync state when initialSettingsOpen prop changes
  useEffect(() => {
    setIsSettingsOpen(initialSettingsOpen)
  }, [initialSettingsOpen])

  const onDismiss = useCallback(() => {
    onClose()
    setIsSettingsOpen(false)
  }, [onClose])

  useOnClickOutside([sidebarRef], onDismiss)

  const toggleSettingsOpen = useCallback(() => {
    setIsSettingsOpen((prev) => !prev)
  }, [])

  const handleEnableAlertsClick = useCallback(() => {
    toggleSettingsOpen()
  }, [toggleSettingsOpen])

  if (!isOpen) return null

  return (
    <Sidebar ref={sidebarRef} isOpen={isOpen}>
      {isSettingsOpen ? (
        <NotificationSettings>
          <SettingsHeader onBack={toggleSettingsOpen} />
        </NotificationSettings>
      ) : (
        <NotificationsList hasSubscription={hasSubscription} onToggleSettings={toggleSettingsOpen}>
          <NotificationsHeader
            isMobile={isMobile}
            areTelegramNotificationsEnabled={areTelegramNotificationsEnabled}
            hasSubscription={hasSubscription}
            onDismiss={onDismiss}
            onToggleSettings={toggleSettingsOpen}
            onEnableAlerts={handleEnableAlertsClick}
          />
        </NotificationsList>
      )}
    </Sidebar>
  )
}
