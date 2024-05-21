import React, { useCallback, useRef, useState } from 'react'

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
  const sidebarRef = useRef(null)

  const onDismiss = useCallback(() => {
    onClose()
    setIsSettingsOpen(false)
  }, [onClose])

  useOnClickOutside(sidebarRef, onDismiss)

  const toggleSettingsOpen = useCallback(() => {
    setIsSettingsOpen((prev) => !prev)
  }, [])

  const isMobile = useMediaQuery(upToSmall)

  if (!isOpen) return null

  return (
    <Sidebar ref={sidebarRef} isOpen={isOpen}>
      {isSettingsOpen ? (
        <NotificationSettings>
          <SidebarHeader isArrowNav>
            <span>
              <ArrowLeft onClick={toggleSettingsOpen} />
            </span>
            <h3>Settings</h3>
          </SidebarHeader>
        </NotificationSettings>
      ) : (
        <NotificationsList>
          <SidebarHeader>
            <span>
              {!isMobile && <DoubleArrowRightIcon onClick={onDismiss} />}
              {isMobile && <CloseIcon onClick={onDismiss} />}
              {/*TODO: uncomment this once we have Telegram integration done*/}
              {/*<SettingsIcon onClick={toggleSettingsOpen} />*/}
            </span>
            <h3>Notifications</h3>
          </SidebarHeader>
        </NotificationsList>
      )}
    </Sidebar>
  )
}
