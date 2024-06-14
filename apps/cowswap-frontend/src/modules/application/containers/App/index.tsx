import { useMemo, lazy, Suspense } from 'react'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import ErrorBoundary from 'legacy/components/ErrorBoundary'
import { URLWarning } from 'legacy/components/Header/URLWarning'
import TopLevelModals from 'legacy/components/TopLevelModals'
import DarkModeQueryParamReader from 'legacy/theme'
import { OrdersPanel } from 'modules/account'
import { useInitializeUtm } from 'modules/utm'
import { InvalidLocalTimeWarning } from 'common/containers/InvalidLocalTimeWarning'
import { useAnalyticsReporter } from 'common/hooks/useAnalyticsReporter'
import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'
import * as styledEl from './styled'
import {
  Color,
  Media,
  MenuBar,
  MenuItem,
  Footer,
  ProductVariant,
  GlobalCoWDAOStyles,
  LoadingApp,
} from '@cowprotocol/ui'
import { CoWDAOFonts } from 'common/styles/CoWDAOFonts'

import IMG_ICON_BRANDED_DOT_RED from '@cowprotocol/assets/images/icon-branded-dot-red.svg'
import IMG_ICON_COW_RUNNER from '@cowprotocol/assets/cow-swap/game.gif'
import IMG_ICON_COW_SLICER from '@cowprotocol/assets/cow-swap/ninja-cow.png'

import { useDarkModeManager } from 'legacy/state/user/hooks'
import { useMediaQuery } from '@cowprotocol/common-hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

import { HeaderControls, HeaderElement } from 'legacy/components/Header/styled'
import { AccountElement } from 'legacy/components/Header/AccountElement'

import { NetworkSelector } from 'legacy/components/Header/NetworkSelector'

import AppziButton from 'legacy/components/AppziButton'
import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'
import { FeatureGuard } from 'common/containers/FeatureGuard'

const RoutesApp = lazy(() => import('./RoutesApp').then((module) => ({ default: module.RoutesApp })))

// Move this to const file ==========
const PRODUCT_VARIANT = ProductVariant.CowSwap

const NAV_ITEMS: MenuItem[] = [
  {
    label: 'Trade',
    children: [
      { icon: IMG_ICON_BRANDED_DOT_RED, href: '/#/1/swap/USDC/COW', label: 'Swap', description: 'Trade tokens' },
      {
        icon: IMG_ICON_BRANDED_DOT_RED,
        href: '/#/1/limit/USDC/COW',
        label: 'Limit order',
        description: 'Set your own price',
      },
      {
        icon: IMG_ICON_BRANDED_DOT_RED,
        href: '/#/1/advanced/USDC/COW',
        label: 'TWAP',
        description: 'Place orders with a time-weighted average price',
      },
    ],
  },
  {
    label: 'Account',
    children: [
      { href: '/#/account', label: 'Account' },
      {
        href: '/#/account/tokens',
        label: 'Tokens',
      },
    ],
  },
  {
    label: 'Learn',
    children: [
      {
        href: 'https://cow.fi/cow-swap',
        label: 'About CoW Swap',
        external: true,
      },
      { href: 'https://cow.fi/learn', label: 'FAQs', external: true },
      { href: 'https://docs.cow.fi/', label: 'Docs ', external: true },
    ],
  },
  {
    label: 'More',
    children: [
      {
        href: 'https://cow.fi/cow-protocol',
        label: 'CoW Protocol',
        external: true,
      },
      {
        href: 'https://cow.fi/cow-amm',
        label: 'CoW AMM',
        external: true,
      },
      {
        href: '/#/play/cow-runner',
        label: 'CoW Runner',
        icon: IMG_ICON_COW_RUNNER,
      },
      {
        href: '/#/play/mev-slicer',
        label: 'MEV Slicer',
        icon: IMG_ICON_COW_SLICER,
      },
    ],
  },
]

const FOOTER_NAV_ITEMS: MenuItem[] = [
  {
    label: 'About',
    children: [
      { href: '#', label: 'Governance' },
      { href: '#', label: 'Token' },
      { href: '#', label: 'Grants' },
      { href: '#', label: 'Careers' },
      { href: '#', label: 'Brand Kit' },
    ],
  },
  {
    label: 'Legal',
    children: [
      { href: '#', label: 'Terms & Conditions' },
      { href: '#', label: 'Cookie Policy' },
      { href: '#', label: 'Privacy Policy' },
    ],
  },
  {
    label: 'Products',
    children: [
      { href: '#', label: 'CoW Swap' },
      { href: '#', label: 'CoW Protocol' },
      { href: '#', label: 'CoW AMM' },
      { href: '#', label: 'MEV Blocker' },
      { href: '#', label: 'Explorer' },
      { href: '#', label: 'Widget' },
      { href: '#', label: 'Hooks Store' },
    ],
  },
  {
    href: '#',
    label: 'Help',
    children: [
      { href: '#', label: 'Dev Docs' },
      { href: '#', label: 'FAQ / Knowledge base' },
      { href: '#', label: 'Send Feedback' },
      { href: '#', label: 'Report Scams' },
    ],
  },
  {
    label: 'Misc.',
    children: [
      { href: '#', label: 'Swag Store' },
      { href: '#', label: 'Token Charts' },
      { href: '#', label: 'For DAOs' },
    ],
  },
]

const ADDITIONAL_FOOTER_CONTENT = (
  <>
    <FeatureGuard featureFlag="cowFortuneEnabled">
      <FortuneWidget />
    </FeatureGuard>
    <AppziButton />
  </>
)

// Move this to const file ==========

export function App() {
  useAnalyticsReporter()
  useInitializeUtm()

  const isInjectedWidgetMode = isInjectedWidget()
  const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts)

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
