import { useCallback, useRef, useState } from 'react'

import { useFeatureFlags, useOnClickOutside } from '@cowprotocol/common-hooks'

import { upToSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import { Sidebar, SidebarHeader, DoubleArrowRightIcon, CloseIcon, ArrowLeft, SettingsIcon } from './styled'

import { NotificationSettings } from '../NotificationSettings'
import { NotificationsList } from '../NotificationsList'

interface NotificationSidebarProps {
  isOpen: boolean
  onClose: () => void
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery(upToSmall)

  const { areTelegramNotificationsEnabled } = useFeatureFlags()

  const onDismiss = useCallback(() => {
    onClose()
    setIsSettingsOpen(false)
  }, [onClose])

  useOnClickOutside([sidebarRef], onDismiss)

  const toggleSettingsOpen = useCallback(() => {
    setIsSettingsOpen((prev) => !prev)
  }, [])

  if (!isOpen) return null

  return (
    <Sidebar ref={sidebarRef} isOpen={isOpen}>
      {isSettingsOpen ? (
        <NotificationSettings>
          <SidebarHeader isArrowNav>
            <span>
              <ArrowLeft
                onClick={toggleSettingsOpen}
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.NOTIFICATIONS,
                  action: 'Close notification settings',
                })}
              />
            </span>
            <h3>Settings</h3>
          </SidebarHeader>
        </NotificationSettings>
      ) : (
        <NotificationsList>
          <SidebarHeader>
            <span>
              {!isMobile && (
                <DoubleArrowRightIcon
                  onClick={onDismiss}
                  data-click-event={toCowSwapGtmEvent({
                    category: CowSwapAnalyticsCategory.NOTIFICATIONS,
                    action: 'Close notifications panel',
                    label: 'desktop',
                  })}
                />
              )}
              {isMobile && (
                <CloseIcon
                  onClick={onDismiss}
                  data-click-event={toCowSwapGtmEvent({
                    category: CowSwapAnalyticsCategory.NOTIFICATIONS,
                    action: 'Close notifications panel',
                    label: 'mobile',
                  })}
                />
              )}
            </span>
            <h3>Notifications</h3>
            {areTelegramNotificationsEnabled && <SettingsIcon size={18} onClick={toggleSettingsOpen} />}
          </SidebarHeader>
        </NotificationsList>
      )}
    </Sidebar>
  )
}
