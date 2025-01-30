import { useCallback, useRef, useState } from 'react'

import { Category, toGtmEvent } from '@cowprotocol/analytics'
import { useOnClickOutside } from '@cowprotocol/common-hooks'

import { upToSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { Sidebar, SidebarHeader, DoubleArrowRightIcon, CloseIcon, ArrowLeft } from './styled'

import { NotificationSettings } from '../NotificationSettings'
import { NotificationsList } from '../NotificationsList'

interface NotificationSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery(upToSmall)

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
                data-click-event={toGtmEvent({
                  category: Category.NOTIFICATIONS,
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
                  data-click-event={toGtmEvent({
                    category: Category.NOTIFICATIONS,
                    action: 'Close notifications panel',
                    label: 'desktop',
                  })}
                />
              )}
              {isMobile && (
                <CloseIcon
                  onClick={onDismiss}
                  data-click-event={toGtmEvent({
                    category: Category.NOTIFICATIONS,
                    action: 'Close notifications panel',
                    label: 'mobile',
                  })}
                />
              )}
            </span>
            <h3>Notifications</h3>
          </SidebarHeader>
        </NotificationsList>
      )}
    </Sidebar>
  )
}
