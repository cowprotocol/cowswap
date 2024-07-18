import { lazy, PropsWithChildren, Suspense, useMemo } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { Color, Footer, GlobalCoWDAOStyles, Media, MenuBar } from '@cowprotocol/ui'

import { NavLink } from 'react-router-dom'
import { ThemeProvider } from 'theme'

import ErrorBoundary from 'legacy/components/ErrorBoundary'
import { AccountElement } from 'legacy/components/Header/AccountElement'
import { NetworkSelector } from 'legacy/components/Header/NetworkSelector'
import { HeaderControls, HeaderElement } from 'legacy/components/Header/styled'
import { URLWarning } from 'legacy/components/Header/URLWarning'
import TopLevelModals from 'legacy/components/TopLevelModals'
import { useDarkModeManager } from 'legacy/state/user/hooks'

import { OrdersPanel } from 'modules/account'
import { useAnalyticsReporterCowSwap } from 'modules/analytics'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { parameterizeTradeRoute, useTradeRouteContext } from 'modules/trade'
import { useInitializeUtm } from 'modules/utm'

import { InvalidLocalTimeWarning } from 'common/containers/InvalidLocalTimeWarning'
import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'
import { useMenuItems } from 'common/hooks/useMenuItems'
import { LoadingApp } from 'common/pure/LoadingApp'
import { CoWDAOFonts } from 'common/styles/CoWDAOFonts'
import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { ADDITIONAL_FOOTER_CONTENT, NAV_ITEMS, PRODUCT_VARIANT } from './menuConsts'
import * as styledEl from './styled'


const RoutesApp = lazy(() => import('./RoutesApp').then((module) => ({ default: module.RoutesApp })))

const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts, 'transparent')

const LinkComponent = ({ href, children }: PropsWithChildren<{ href: string }>) => {
  const external = href.startsWith('http')

  return (
    <NavLink to={href} target={external ? '_blank' : '_self'} rel={external ? 'noopener noreferrer' : undefined}>
      {children}
    </NavLink>
  )
}

export function App() {
  useAnalyticsReporterCowSwap()
  useInitializeUtm()

  const isInjectedWidgetMode = isInjectedWidget()
  const menuItems = useMenuItems()

  const [darkMode, toggleDarkMode] = useDarkModeManager()

  const settingsNavItems = useMemo(
    () => [
      {
        label: darkMode ? 'Light mode' : 'Dark mode',
        onClick: toggleDarkMode,
      },
    ],
    [darkMode, toggleDarkMode]
  )

  const tradeContext = useTradeRouteContext()

  const navItems = useMemo(() => {
    return [
      {
        label: 'Trade',
        children: menuItems.map((item) => {
          const href = parameterizeTradeRoute(tradeContext, item.route, true)

          return { href, label: item.label, description: item.description }
        }),
      },
      ...NAV_ITEMS,
    ]
  }, [tradeContext, menuItems])

  const injectedWidgetParams = useInjectedWidgetParams()
  const { pendingActivity } = useCategorizeRecentActivity()
  const isMobile = useMediaQuery(Media.upToMedium(false))

  const persistentAdditionalContent = (
    <HeaderControls>
      {!injectedWidgetParams.hideNetworkSelector && <NetworkSelector />}
      <HeaderElement>
        <AccountElement pendingActivities={pendingActivity} />
      </HeaderElement>
    </HeaderControls>
  )

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingApp />}>
        <RedirectAnySwapAffectedUsers />
        <ThemeProvider />
        <GlobalStyles />

        <styledEl.AppWrapper>
          <URLWarning />
          <InvalidLocalTimeWarning />

          <OrdersPanel />

          {!isInjectedWidgetMode && (
            // TODO: Move hard-coded colors to theme
            <MenuBar
              navItems={navItems}
              productVariant={PRODUCT_VARIANT}
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
              persistentAdditionalContent={isMobile ? null : persistentAdditionalContent} // This will stay at its original location
              additionalContent={null} // On desktop renders inside the menu bar, on mobile renders inside the mobile menu
            />
          )}

          <styledEl.BodyWrapper>
            <TopLevelModals />

            <RoutesApp />

            <styledEl.Marginer />
          </styledEl.BodyWrapper>

          {!isInjectedWidgetMode && (
            <Footer
              productVariant={PRODUCT_VARIANT}
              additionalFooterContent={ADDITIONAL_FOOTER_CONTENT}
              hasTouchFooter
            />
          )}

          {/* Render MobileHeaderControls outside of MenuBar on mobile */}
          {isMobile && !isInjectedWidgetMode && persistentAdditionalContent}
        </styledEl.AppWrapper>
      </Suspense>
    </ErrorBoundary>
  )
}
