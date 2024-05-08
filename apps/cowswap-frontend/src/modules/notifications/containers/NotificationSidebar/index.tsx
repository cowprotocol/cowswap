import React, { useCallback, useRef, useState } from 'react'

import ICON_DOUBLE_ARROW_RIGHT from '@cowprotocol/assets/images/double-arrow-right.svg'
import ICON_SETTINGS from '@cowprotocol/assets/images/settings.svg'
import { useOnClickOutside } from '@cowprotocol/common-hooks'

import { ArrowLeft } from 'react-feather'
import SVG from 'react-inlinesvg'

import { Sidebar, SidebarHeader } from './styled'

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

  if (!isOpen) return null

  return (
    <Sidebar ref={sidebarRef} isOpen={isOpen}>
      {isSettingsOpen ? (
        <NotificationSettings>
          <SidebarHeader alignLeft>
            <span>
              <ArrowLeft size="18" onClick={toggleSettingsOpen} />
            </span>
            <h3>Settings</h3>
          </SidebarHeader>
        </NotificationSettings>
      ) : (
        <NotificationsList>
          <SidebarHeader>
            <span>
              <SVG src={ICON_DOUBLE_ARROW_RIGHT} onClick={onDismiss} />
              <SVG src={ICON_SETTINGS} onClick={toggleSettingsOpen} />
            </span>
            <h3>Notifications</h3>
          </SidebarHeader>
        </NotificationsList>
      )}
    </Sidebar>
  )
}
