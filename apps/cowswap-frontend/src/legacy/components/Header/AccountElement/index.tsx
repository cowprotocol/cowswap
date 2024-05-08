import { useSetAtom } from 'jotai'
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import ICON_DOUBLE_ARROW_RIGHT from '@cowprotocol/assets/images/double-arrow-right.svg'
import ICON_NOTIFICATION from '@cowprotocol/assets/images/notification.svg'
import ICON_SETTINGS from '@cowprotocol/assets/images/settings.svg'
import { useNativeCurrencyAmount } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import { upToLarge, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { useToggleAccountModal } from 'modules/account'
import {
  groupNotificationsByDate,
  markNotificationsAsReadAtom,
  useAccountNotifications,
  useUnreadNotifications,
} from 'modules/notifications'
import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { NotificationSettings } from './NotificationSettings'
import {
  BalanceText,
  NotificationBell,
  NotificationCard,
  NotificationList,
  NotificationThumb,
  Sidebar,
  SidebarHeader,
  Wrapper,
} from './styled'

const DATE_FORMAT_OPTION: Intl.DateTimeFormatOptions = {
  dateStyle: 'long',
}

interface AccountElementProps {
  pendingActivities: string[]
  standaloneMode?: boolean
  className?: string
}

export function AccountElement({ className, standaloneMode, pendingActivities }: AccountElementProps) {
  const { account, chainId } = useWalletInfo()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const userEthBalance = useNativeCurrencyAmount(chainId, account)
  const toggleAccountModal = useToggleAccountModal()
  const unreadNotifications = useUnreadNotifications()
  const unreadNotificationsCount = Object.keys(unreadNotifications).length
  const nativeToken = NATIVE_CURRENCIES[chainId].symbol
  const isUpToLarge = useMediaQuery(upToLarge)

  // Notifications sidebar
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)

  // Close sidebar if click outside
  useOnClickOutside(sidebarRef, () => isSidebarOpen && setSidebarOpen(false))

  return (
    <>
      <Wrapper className={className} active={!!account}>
        {standaloneMode !== false && account && !isChainIdUnsupported && userEthBalance && chainId && !isUpToLarge && (
          <BalanceText>
            <TokenAmount amount={userEthBalance} tokenSymbol={{ symbol: nativeToken }} />
          </BalanceText>
        )}
        <Web3Status pendingActivities={pendingActivities} onClick={() => account && toggleAccountModal()} />
        <NotificationBell onClick={() => setSidebarOpen(true)} hasNotification={unreadNotificationsCount > 0}>
          <SVG src={ICON_NOTIFICATION} />
        </NotificationBell>
      </Wrapper>

      {/* Temporary position of notifications sidebar */}
      <NotificationSidebar ref={sidebarRef} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}

interface NotificationSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationSidebar = forwardRef<HTMLDivElement, NotificationSidebarProps>(({ isOpen, onClose }, ref) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const { account } = useWalletInfo()

  const unreadNotifications = useUnreadNotifications()
  const markNotificationsAsRead = useSetAtom(markNotificationsAsReadAtom)
  const notifications = useAccountNotifications()

  const groups = useMemo(() => (notifications ? groupNotificationsByDate(notifications) : null), [notifications])

  const toggleSettingsOpen = useCallback(() => {
    setIsSettingsOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    if (!isOpen || !account || !notifications) return

    markNotificationsAsRead(account, notifications.map(({ id }) => id) || [])
  }, [isOpen, account, notifications])

  if (!isOpen) return null

  return (
    <Sidebar ref={ref} isOpen={isOpen}>
      {isSettingsOpen ? (
        <NotificationSettings toggleSettingsOpen={toggleSettingsOpen} />
      ) : (
        <>
          <SidebarHeader>
            <span>
              <SVG src={ICON_DOUBLE_ARROW_RIGHT} onClick={onClose} />
              <SVG src={ICON_SETTINGS} onClick={toggleSettingsOpen} />
            </span>
            <h3>Notifications</h3>
          </SidebarHeader>
          <NotificationList>
            {groups?.map((group) => (
              <>
                <h4>{group.date.toLocaleString(undefined, DATE_FORMAT_OPTION)}</h4>
                <div key={group.date.getTime()}>
                  {group.notifications.map(({ id, thumbnail, title, description, url }) => {
                    const target = url
                      ? url.includes(window.location.host) || url.startsWith('/')
                        ? '_parent'
                        : '_blank'
                      : undefined

                    return (
                      <NotificationCard
                        key={id}
                        isRead={!unreadNotifications[id]}
                        href={url || undefined}
                        target={target}
                        rel={target === '_blank' ? 'noopener noreferrer' : ''}
                      >
                        {thumbnail && (
                          <NotificationThumb>
                            <img src={thumbnail} alt={title} />
                          </NotificationThumb>
                        )}
                        <span>
                          <strong>{title}</strong>
                          <p>{description}</p>
                        </span>
                      </NotificationCard>
                    )
                  })}
                </div>
              </>
            ))}
          </NotificationList>
        </>
      )}
    </Sidebar>
  )
})
