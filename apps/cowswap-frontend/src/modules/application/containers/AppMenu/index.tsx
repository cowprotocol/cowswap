import { useAtom } from 'jotai'
import { PropsWithChildren, ReactNode, useMemo } from 'react'

import { SUPPORTED_LOCALES } from '@cowprotocol/common-const'
import { useFeatureFlags, useIsSolanaPublicLaunched, useMediaQuery } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { Color, MenuBar, type CowSwapTheme } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { alphaNetworksEnabledAtom } from 'entities/alphaNetworks'
import SVG from 'react-inlinesvg'
import { NavLink } from 'react-router'

import { useDarkModeManager, useUserLocaleManager } from 'legacy/state/user/hooks'

import {
  GRAFFITI_MENU_BLUR,
  graffitiThemeEnabledAtom,
  isGraffitiTheme,
  useIsGraffitiThemeOffered,
  useIsGraffitiWallEnabled,
} from 'modules/graffitiWall'
import { useGetTradeUrlParams } from 'modules/trade'

import { APP_HEADER_ELEMENT_ID } from 'common/constants/common'
import { Routes } from 'common/constants/routes'
import { useIsInternationalizationEnabled } from 'common/hooks/featureFlags/useIsInternationalizationEnabled'
import { useMenuItems } from 'common/hooks/useMenuItems'
import { parameterizeTradeRoute } from 'common/modules/tradeNavigation'
import { isTwapSupportedChain } from 'common/utils/isTwapSupportedChain'

import { HideMobile, isMobileQuery } from './styled'

import { useAppTheme } from '../../hooks/useAppTheme'
import { NAV_ITEMS, PRODUCT_VARIANT } from '../App/menuConsts'

const LinkComponent = ({ href, children }: PropsWithChildren<{ href: string }>): ReactNode => {
  const external = href.startsWith('http')

  // The RWA app is served by a separate deployment, so it needs a full page load instead of a hash route
  if (href === Routes.RWA) {
    return <a href={href}>{children}</a>
  }

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

interface SettingsNavItem {
  label: string
  onClick: Command
}

export function AppMenu({ children, customTheme: overriddenCustomTheme }: AppMenuProps): ReactNode {
  const { chainId } = useWalletInfo()
  const isInjectedWidgetMode = isInjectedWidget()
  const menuItems = useMenuItems()
  const { isSolversEnabled, isRwaEnabled } = useFeatureFlags()
  const [darkMode, toggleDarkMode] = useDarkModeManager()
  const { setLocale } = useUserLocaleManager()
  const isMobile = useMediaQuery(isMobileQuery(false))
  const resolvedCustomTheme = useAppTheme()
  const customTheme = overriddenCustomTheme ?? resolvedCustomTheme ?? (darkMode ? 'dark' : 'light')
  const getTradeUrlParams = useGetTradeUrlParams()
  const { t } = useLingui()
  const isInternationalizationEnabled = useIsInternationalizationEnabled()
  const isGraffitiWallEnabled = useIsGraffitiWallEnabled()

  const settingsNavItems = useSettingsNavItems(darkMode, toggleDarkMode)

  const languageNavItems = {
    label: t`Languages`,
    children: SUPPORTED_LOCALES.map((item) => ({
      label: item,
      onClick: () => setLocale(item),
    })),
  }

  const tradeMenuItems = useMemo(
    () => menuItems.filter((item) => item.route !== Routes.ADVANCED_ORDERS || isTwapSupportedChain(chainId)),
    [menuItems, chainId],
  )

  const navItems = useMemo(() => {
    return [
      {
        label: t`Trade`,
        children: tradeMenuItems.map((item) => {
          const href =
            item.route === Routes.RWA ? item.route : parameterizeTradeRoute(getTradeUrlParams(item), item.route, true)

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
      ...NAV_ITEMS(chainId, { isSolversEnabled: !!isSolversEnabled, isGraffitiWallEnabled }),
    ]
  }, [t, tradeMenuItems, chainId, getTradeUrlParams, isSolversEnabled, isGraffitiWallEnabled])

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
      blur={isGraffitiTheme(customTheme) ? GRAFFITI_MENU_BLUR : undefined}
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
      isRwaEnabled={!!isRwaEnabled}
    />
  )
}

function useSettingsNavItems(darkMode: boolean, toggleDarkMode: Command): SettingsNavItem[] {
  const { isAlphaNetworksOptionVisible } = useFeatureFlags()
  const isSolanaPublicLaunched = useIsSolanaPublicLaunched()
  const [areAlphaNetworksEnabled, setAlphaNetworksEnabled] = useAtom(alphaNetworksEnabledAtom)
  const [graffitiThemeEnabled, setGraffitiThemeEnabled] = useAtom(graffitiThemeEnabledAtom)
  const graffitiThemeOffered = useIsGraffitiThemeOffered()
  const { t } = useLingui()

  return useMemo(
    () => [
      {
        label: darkMode ? t`Light Mode` : t`Dark Mode`,
        onClick: toggleDarkMode,
      },
      ...(graffitiThemeOffered
        ? [
            {
              label: graffitiThemeEnabled ? t`Disable Graffiti Theme` : t`Enable Graffiti Theme`,
              onClick: () => setGraffitiThemeEnabled(!graffitiThemeEnabled),
            },
          ]
        : []),
      ...(isAlphaNetworksOptionVisible && !isSolanaPublicLaunched
        ? [
            {
              label: areAlphaNetworksEnabled ? t`Disable Alpha Networks` : t`Enable Alpha Networks`,
              onClick: () => setAlphaNetworksEnabled(!areAlphaNetworksEnabled),
            },
          ]
        : []),
    ],
    [
      darkMode,
      toggleDarkMode,
      graffitiThemeOffered,
      graffitiThemeEnabled,
      setGraffitiThemeEnabled,
      isAlphaNetworksOptionVisible,
      isSolanaPublicLaunched,
      areAlphaNetworksEnabled,
      setAlphaNetworksEnabled,
      t,
    ],
  )
}
