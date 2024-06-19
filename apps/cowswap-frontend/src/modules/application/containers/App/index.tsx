import { useMemo, lazy, Suspense } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { Color, Media, MenuBar, Footer, GlobalCoWDAOStyles, LoadingApp } from '@cowprotocol/ui'

import ErrorBoundary from 'legacy/components/ErrorBoundary'
import { AccountElement } from 'legacy/components/Header/AccountElement'
import { NetworkSelector } from 'legacy/components/Header/NetworkSelector'
import { HeaderControls, HeaderElement } from 'legacy/components/Header/styled'
import { URLWarning } from 'legacy/components/Header/URLWarning'
import TopLevelModals from 'legacy/components/TopLevelModals'
import { useDarkModeManager } from 'legacy/state/user/hooks'
import DarkModeQueryParamReader from 'legacy/theme'

import { OrdersPanel } from 'modules/account'
import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useInitializeUtm } from 'modules/utm'

import { InvalidLocalTimeWarning } from 'common/containers/InvalidLocalTimeWarning'
import { useAnalyticsReporter } from 'common/hooks/useAnalyticsReporter'
import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'
import { CoWDAOFonts } from 'common/styles/CoWDAOFonts'
import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { NAV_ITEMS, FOOTER_NAV_ITEMS, PRODUCT_VARIANT, ROOT_DOMAIN, ADDITIONAL_FOOTER_CONTENT } from './const'
import * as styledEl from './styled'

const RoutesApp = lazy(() => import('./RoutesApp').then((module) => ({ default: module.RoutesApp })))

const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts)

export function App() {
  useAnalyticsReporter()
  useInitializeUtm()

  const isInjectedWidgetMode = isInjectedWidget()

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
      <Suspense fallback={<LoadingApp darkMode={darkMode} />}>
        <RedirectAnySwapAffectedUsers />
        <DarkModeQueryParamReader />
        <GlobalStyles />

        <styledEl.AppWrapper>
          <URLWarning />
          <InvalidLocalTimeWarning />

          <OrdersPanel />

          {!isInjectedWidgetMode && (
            // TODO: Move hard-coded colors to theme
            <MenuBar
              navItems={NAV_ITEMS}
              theme={darkMode ? 'dark' : 'light'}
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
              persistentAdditionalContent={isMobile ? null : persistentAdditionalContent} // This will stay at its original location
              additionalContent={null} // On desktop renders inside the menu bar, on mobile renders inside the mobile menu
              rootDomain={ROOT_DOMAIN}
            />
          )}

          <styledEl.BodyWrapper>
            <TopLevelModals />

            <RoutesApp />

            <styledEl.Marginer />
          </styledEl.BodyWrapper>

          {!isInjectedWidgetMode && (
            <Footer
              navItems={FOOTER_NAV_ITEMS}
              theme={darkMode ? 'dark' : 'light'}
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
