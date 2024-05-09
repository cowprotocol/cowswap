import React, { useCallback, useRef, useState } from 'react'

import { useOnClickOutside } from '@cowprotocol/common-hooks'

import { ArrowLeft } from 'react-feather'
import SVG from 'react-inlinesvg'

import { Sidebar, SidebarHeader, DoubleArrowRightIcon, SettingsIcon, CloseIcon } from './styled'

import { NotificationSettings } from '../NotificationSettings'
import { NotificationsList } from '../NotificationsList'
import { upToSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'

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
          <SidebarHeader alignLeft>
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
              <SettingsIcon onClick={toggleSettingsOpen} />
            </span>
            <h3>Notifications</h3>
          </SidebarHeader>
        </NotificationsList>
      )}
    </Sidebar>
  )
}
