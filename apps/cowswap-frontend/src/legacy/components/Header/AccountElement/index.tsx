import React, { useState, useRef, forwardRef, ReactNode, Ref } from 'react'

import { useNativeCurrencyAmount } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { upToLarge, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { useToggleAccountModal } from 'modules/account'
import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { useOnClickOutside } from '@cowprotocol/common-hooks'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import {
  Wrapper,
  BalanceText,
  NotificationBell,
  Sidebar,
  SidebarHeader,
  NotificationList,
  NotificationCard,
} from './styled'

import SVG from 'react-inlinesvg'
import ICON_NOTIFICATION from '@cowprotocol/assets/images/notification.svg'
import ICON_DOUBLE_ARROW_RIGHT from '@cowprotocol/assets/images/double-arrow-right.svg'
import ICON_SETTINGS from '@cowprotocol/assets/images/settings.svg'

const NOTIFICATIONS_DATA = [
  {
    date: 'May 6',
    items: [
      {
        id: 1,
        title: 'Get 10,000 CoWPoints',
        description: 'That could mean 10,000 points to save on your next trade. T&Cs apply. Learn more.',
        link: 'https://cow.fi',
      },
      {
        id: 2,
        title: 'Get 10,000 CoWPoints',
        description: 'That could mean 10,000 points to save on your next trade. T&Cs apply.',
        link: 'https://cow.fi',
      },
    ],
  },
  {
    date: 'May 1',
    items: [
      {
        id: 3,
        title: 'Get 10,000 CoWPoints',
        description: 'That could mean 10,000 points to save on your next trade. T&Cs apply.',
        link: 'https://cow.fi',
      },
    ],
  },
  {
    date: 'April 30',
    items: [
      {
        id: 4,
        title: 'Get 10,000 CoWPoints',
        description: 'That could mean 10,000 points to save on your next trade. T&Cs apply.',
        link: 'https://cow.fi',
      },

      {
        id: 5,
        title: 'Get 10,000 CoWPoints',
        description: 'That could mean 10,000 points to save on your next trade. T&Cs apply.',
        link: 'https://cow.fi',
      },

      {
        id: 6,
        title: 'Get 10,000 CoWPoints',
        description: 'That could mean 10,000 points to save on your next trade. T&Cs apply.',
        link: 'https://cow.fi',
      },

      {
        id: 7,
        title: 'Get 10,000 CoWPoints',
        description: 'That could mean 10,000 points to save on your next trade. T&Cs apply.',
        link: 'https://cow.fi',
      },
    ],
  },
] as DateGroup[]

interface Notification {
  id: number
  title: string
  description: string
  link: string
}

interface DateGroup {
  date: string
  items: Notification[]
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
        <NotificationBell onClick={() => setSidebarOpen(true)}>
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
  children?: ReactNode
}

export const NotificationSidebar = forwardRef<HTMLDivElement, NotificationSidebarProps>(
  ({ isOpen, onClose, children }, ref) => {
    if (!isOpen) return null

    return (
      <Sidebar ref={ref} isOpen={isOpen}>
        <SidebarHeader>
          <span>
            <SVG src={ICON_DOUBLE_ARROW_RIGHT} onClick={onClose} />
            <SVG src={ICON_SETTINGS} />
          </span>
          <h3>Notifications</h3>
        </SidebarHeader>
        <NotificationList>
          {NOTIFICATIONS_DATA.map((group) => (
            <>
              <h4>{group.date}</h4>
              <div key={group.date}>
                {group.items.map((item) => (
                  <NotificationCard key={item.id}>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </NotificationCard>
                ))}
              </div>
            </>
          ))}
        </NotificationList>
        {children}
      </Sidebar>
    )
  }
)
