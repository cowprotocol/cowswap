import { ReactNode, useCallback, useRef, useState } from 'react'

import { useNativeCurrencyAmount } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { useMediaQuery } from '@cowprotocol/common-hooks'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { TokenAmount, Media } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import ReactDOM from 'react-dom'

import { useToggleAccountModal } from 'modules/account'
import { NotificationBell, NotificationSidebar } from 'modules/notifications'
import { useHasNotificationSubscription } from 'modules/notifications/hooks/useHasNotificationSubscription'
import { useNotificationAlertDismissal } from 'modules/notifications/hooks/useNotificationAlertDismissal'
import { useUnreadNotifications } from 'modules/notifications/hooks/useUnreadNotifications'
import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { NotificationAlertPopover } from './NotificationAlertPopover'
import { BalanceText, Wrapper } from './styled'

function createNotificationClickEventData(event: string): string {
  return toCowSwapGtmEvent({
    category: CowSwapAnalyticsCategory.NOTIFICATIONS,
    action: event,
  })
}

interface NotificationSidebarPortalProps {
  portalTarget: HTMLElement | null
  isSidebarOpen: boolean
  onClose: () => void
  initialSettingsOpen: boolean
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

interface AccountElementProps {
  standaloneMode?: boolean
  className?: string
}

export function AccountElement({ className, standaloneMode }: AccountElementProps): ReactNode {
  const { account, chainId } = useWalletInfo()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const userEthBalance = useNativeCurrencyAmount(chainId, account)
  const toggleAccountModal = useToggleAccountModal()
  const nativeTokenSymbol = NATIVE_CURRENCIES[chainId].symbol
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))

  const unreadNotifications = useUnreadNotifications()
  const unreadNotificationsCount = Object.keys(unreadNotifications).length

  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [shouldOpenSettings, setShouldOpenSettings] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { isDismissed, dismiss } = useNotificationAlertDismissal()
  const { areTelegramNotificationsEnabled } = useFeatureFlags()
  const { hasSubscription, isLoading } = useHasNotificationSubscription()
  const shouldShowPopover =
    areTelegramNotificationsEnabled && !!account && !isDismissed && !hasSubscription && !isLoading

  const shouldRenderBalance =
    standaloneMode !== false && account && !isChainIdUnsupported && userEthBalance && chainId && !isUpToLarge

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
        {shouldRenderBalance && (
          <BalanceText>
            <TokenAmount amount={userEthBalance} tokenSymbol={{ symbol: nativeTokenSymbol }} />
          </BalanceText>
        )}
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
