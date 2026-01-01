import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import ICON_NOTIFICATION_SETTINGS from 'assets/images/icon-notification-settings.svg'
import SVG from 'react-inlinesvg'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import { Sidebar, SidebarHeader, ArrowLeft, NotificationSettingsIcon, EnableAlertsButtonWithIcon } from './styled'

import { useHasNotificationSubscription } from '../../hooks/useHasNotificationSubscription'
import { useNotificationSettingsPopoverDismissal } from '../../hooks/useNotificationSettingsPopoverDismissal'
import { NotificationSettingsPopover } from '../../pure/NotificationSettingsPopover'
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
      <h3>
        <Trans>Trade alerts</Trans>
      </h3>
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
  shouldShowSettingsPopover: boolean
  onDismissSettingsPopover: () => void
  headerRef: React.RefObject<HTMLDivElement | null>
}

function NotificationsHeader({
  isMobile,
  areTelegramNotificationsEnabled,
  hasSubscription,
  onDismiss,
  onToggleSettings,
  onEnableAlerts,
  shouldShowSettingsPopover,
  onDismissSettingsPopover,
  headerRef,
}: NotificationsHeaderProps): ReactNode {
  return (
    <SidebarHeader ref={headerRef}>
      <span>
        <ArrowLeft
          onClick={onDismiss}
          data-click-event={toCowSwapGtmEvent({
            category: CowSwapAnalyticsCategory.NOTIFICATIONS,
            action: 'Close notifications panel',
            label: isMobile ? 'mobile' : 'desktop',
          })}
        />
      </span>
      <h3>
        <Trans>Notifications</Trans>
      </h3>
      {areTelegramNotificationsEnabled &&
        (hasSubscription ? (
          <NotificationSettingsPopover
            show={shouldShowSettingsPopover}
            onDismiss={onDismissSettingsPopover}
            containerRef={headerRef}
          >
            <NotificationSettingsIcon
              onClick={onToggleSettings}
              aria-label={t`Trade alert settings`}
              data-click-event={toCowSwapGtmEvent({
                category: CowSwapAnalyticsCategory.NOTIFICATIONS,
                action: 'Open notification settings',
                label: 'notification sidebar',
              })}
            >
              <SVG src={ICON_NOTIFICATION_SETTINGS} />
            </NotificationSettingsIcon>
          </NotificationSettingsPopover>
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
  const headerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery(Media.upToSmall(false))

  const { areTelegramNotificationsEnabled } = useFeatureFlags()
  const { hasSubscription } = useHasNotificationSubscription()
  const { isDismissed: isSettingsPopoverDismissed, dismiss: dismissSettingsPopover } =
    useNotificationSettingsPopoverDismissal()

  // Show settings popover when trade alerts are enabled (hasSubscription) but popover hasn't been dismissed
  const shouldShowSettingsPopover = hasSubscription && !isSettingsPopoverDismissed && !isSettingsOpen

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

  // Force re-mount of NotificationsList when returning from settings to refresh subscription status
  const listKey = `notifications-list-${isSettingsOpen}`

  return (
    <Sidebar ref={sidebarRef} isOpen={isOpen}>
      {isSettingsOpen ? (
        <NotificationSettings>
          <SettingsHeader onBack={toggleSettingsOpen} />
        </NotificationSettings>
      ) : (
        <NotificationsList
          key={listKey}
          hasSubscription={hasSubscription}
          onToggleSettings={areTelegramNotificationsEnabled ? toggleSettingsOpen : undefined}
        >
          <NotificationsHeader
            isMobile={isMobile}
            areTelegramNotificationsEnabled={areTelegramNotificationsEnabled}
            hasSubscription={hasSubscription}
            onDismiss={onDismiss}
            onToggleSettings={toggleSettingsOpen}
            onEnableAlerts={handleEnableAlertsClick}
            shouldShowSettingsPopover={shouldShowSettingsPopover}
            onDismissSettingsPopover={dismissSettingsPopover}
            headerRef={headerRef}
          />
        </NotificationsList>
      )}
    </Sidebar>
  )
}
