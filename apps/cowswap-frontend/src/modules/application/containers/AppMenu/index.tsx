import { PropsWithChildren, ReactNode, useMemo } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { Color, Media, MenuBar } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import { NavLink } from 'react-router'

import { useDarkModeManager } from 'legacy/state/user/hooks'

import { parameterizeTradeRoute, useGetTradeUrlParams } from 'modules/trade'

import { APP_HEADER_ELEMENT_ID } from 'common/constants/common'
import { useCustomTheme } from 'common/hooks/useCustomTheme'
import { useMenuItems } from 'common/hooks/useMenuItems'

import { NAV_ITEMS, PRODUCT_VARIANT } from '../App/menuConsts'

const LinkComponent = ({ href, children }: PropsWithChildren<{ href: string }>): ReactNode => {
  const external = href.startsWith('http')

  return (
    <NavLink to={href} target={external ? '_blank' : '_self'} rel={external ? 'noopener noreferrer' : undefined}>
      {children}
    </NavLink>
  )
}

interface AppMenuProps {
  children: ReactNode
}

export function AppMenu({ children }: AppMenuProps): ReactNode {
  const isInjectedWidgetMode = isInjectedWidget()
  const menuItems = useMenuItems()
  const [darkMode, toggleDarkMode] = useDarkModeManager()

  const isMobile = useMediaQuery(Media.upToMedium(false))

  const customTheme = useCustomTheme()

  const settingsNavItems = useMemo(
    () => [
      {
        label: darkMode ? 'Light mode' : 'Dark mode',
        onClick: toggleDarkMode,
      },
    ],
    [darkMode, toggleDarkMode],
  )

  const getTradeUrlParams = useGetTradeUrlParams()

  const navItems = useMemo(() => {
    return [
      {
        label: 'Trade',
        children: menuItems.map((item) => {
          const href = parameterizeTradeRoute(getTradeUrlParams(item), item.route, true)

          return {
            href,
            label: item.label,
            description: item.description,
            badge: item.badgeImage ? <SVG src={item.badgeImage} width={10} height={10} /> : item.badge,
            badgeType: item.badgeType,
          }
        }),
      },
      ...NAV_ITEMS,
    ]
  }, [menuItems, getTradeUrlParams])

  if (isInjectedWidgetMode) return null

  // TODO: Move hard-coded colors to theme
  return (
    <MenuBar
      id={APP_HEADER_ELEMENT_ID}
      navItems={navItems}
      productVariant={PRODUCT_VARIANT}
      customTheme={customTheme}
      settingsNavItems={settingsNavItems}
      showGlobalSettings
      bgColorDark={'rgb(222 227 230 / 7%)'}
      colorDark={'#DEE3E6'}
      bgDropdownColorLight={Color.neutral100}
      bgDropdownColorDark={Color.neutral0}
      defaultFillDark="rgba(222, 227, 230, 0.4)"
      activeFillDark="#DEE3E6"
      activeBackgroundDark="#282854"
      hoverBackgroundDark={'#18193B'}
      LinkComponent={LinkComponent}
      persistentAdditionalContent={isMobile ? null : children} // This will stay at its original location
      additionalContent={null} // On desktop renders inside the menu bar, on mobile renders inside the mobile menu
    />
  )
}
