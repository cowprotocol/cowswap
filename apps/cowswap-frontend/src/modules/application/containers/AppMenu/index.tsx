import { PropsWithChildren, ReactNode, useMemo } from 'react'

import { SUPPORTED_LOCALES } from '@cowprotocol/common-const'
import { useMediaQuery } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { Color, MenuBar, type CowSwapTheme } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'
import { NavLink } from 'react-router'

import { useDarkModeManager, useUserLocaleManager } from 'legacy/state/user/hooks'

import { parameterizeTradeRoute, useGetTradeUrlParams } from 'modules/trade'

import { APP_HEADER_ELEMENT_ID } from 'common/constants/common'
import { useIsInternationalizationEnabled } from 'common/hooks/featureFlags/useIsInternationalizationEnabled'
import { useCustomTheme } from 'common/hooks/useCustomTheme'
import { useMenuItems } from 'common/hooks/useMenuItems'

import { HideMobile, isMobileQuery } from './styled'

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
  customTheme?: CowSwapTheme
}

export function AppMenu({ children, customTheme: overriddenCustomTheme }: AppMenuProps): ReactNode {
  const { chainId } = useWalletInfo()
  const isInjectedWidgetMode = isInjectedWidget()
  const menuItems = useMenuItems()
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  const { setLocale } = useUserLocaleManager()
  const isMobile = useMediaQuery(isMobileQuery(false))
  const resolvedCustomTheme = useCustomTheme()
  const customTheme = overriddenCustomTheme ?? resolvedCustomTheme
  const getTradeUrlParams = useGetTradeUrlParams()
  const { t } = useLingui()
  const isInternationalizationEnabled = useIsInternationalizationEnabled()

  const settingsNavItems = useMemo(
    () => [
      {
        label: darkMode ? t`Light mode` : t`Dark mode`,
        onClick: toggleDarkMode,
      },
    ],
    [darkMode, toggleDarkMode, t],
  )

  const languageNavItems = {
    label: t`Languages`,
    children: SUPPORTED_LOCALES.map((item) => ({
      label: item,
      onClick: () => setLocale(item),
    })),
  }

  const navItems = useMemo(() => {
    return [
      {
        label: t`Trade`,
        children: menuItems.map((item) => {
          const href = parameterizeTradeRoute(getTradeUrlParams(item), item.route, true)

          return {
            href,
            label: item.label,
            description: item.description,
            badge: item.badgeImage ? (
              <SVG src={item.badgeImage} width={10} height={10} />
            ) : item.badge ? (
              item.badge
            ) : undefined,
            badgeType: item.badgeType,
          }
        }),
      },
      ...NAV_ITEMS(chainId),
    ]
  }, [t, menuItems, chainId, getTradeUrlParams])

  if (isInjectedWidgetMode) return null

  // TODO: Move hard-coded colors to theme
  return (
    <MenuBar
      LinkComponent={LinkComponent}
      activeBackgroundDark="#282854"
      activeFillDark="#DEE3E6"
      additionalContent={null} // On desktop renders inside the menu bar, on mobile renders inside the mobile menu
      bgColorDark={'rgb(222 227 230 / 7%)'}
      bgDropdownColorDark={Color.neutral0}
      bgDropdownColorLight={Color.neutral100}
      colorDark={'#DEE3E6'}
      customTheme={customTheme}
      defaultFillDark="rgba(222, 227, 230, 0.4)"
      hoverBackgroundDark={'#18193B'}
      id={APP_HEADER_ELEMENT_ID}
      languageNavItems={languageNavItems}
      navItems={navItems}
      persistentAdditionalContent={isMobile ? null : <HideMobile>{children}</HideMobile>} // This will stay at its original location
      productVariant={PRODUCT_VARIANT}
      settingsNavItems={settingsNavItems}
      showGlobalSettings
      isInternationalizationEnabled={isInternationalizationEnabled}
    />
  )
}
