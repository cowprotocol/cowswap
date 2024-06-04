// import { CHRISTMAS_THEME_ENABLED } from '@cowprotocol/common-const'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import ErrorBoundary from 'legacy/components/ErrorBoundary'
// import Footer from 'legacy/components/Footer'
// import Header from 'legacy/components/Header'
import { URLWarning } from 'legacy/components/Header/URLWarning'
import TopLevelModals from 'legacy/components/TopLevelModals'
import DarkModeQueryParamReader from 'legacy/theme'

import { OrdersPanel } from 'modules/account'
import { useInitializeUtm } from 'modules/utm'
// import { WinterFooter } from 'modules/winterEdition'

import { InvalidLocalTimeWarning } from 'common/containers/InvalidLocalTimeWarning'
import { useAnalyticsReporter } from 'common/hooks/useAnalyticsReporter'
import RedirectAnySwapAffectedUsers from 'pages/error/AnySwapAffectedUsers/RedirectAnySwapAffectedUsers'

import { RoutesApp } from './RoutesApp'
import * as styledEl from './styled'

import { MenuBar, MenuItem, Footer, ProductVariant, GlobalCoWDAOStyles, Color } from '@cowprotocol/ui'

import { CoWDAOFonts } from 'common/styles/CoWDAOFonts'
import IMG_ICON_BRANDED_DOT_RED from '@cowprotocol/assets/images/icon-branded-dot-red.svg'

// Move this to const file ==========
const THEME_MODE = 'light'
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
    label: 'Learn',
    children: [
      {
        href: 'https://cow.fi/cow-swap',
        label: 'About CoW Swap',
        external: true,
      },
      { href: 'https://cow.fi/learn', label: 'FAQs', external: true },
      { href: 'https://cow.fi/', label: 'Docs ', external: true },
    ],
  },
  {
    label: 'More',
    children: [
      {
        href: 'https://cow.fi/',
        label: 'CoW Protocol',
        description: 'Build with CoW Protocol',
        external: true,
      },
      {
        href: 'https://cow.fi/',
        label: 'CoW AMM',
        description: 'Deploy liquidity with CoW AMM',
        external: true,
      },
    ],
  },
]

const NAV_ITEMS_SETTINGS: MenuItem[] = [
  {
    label: 'Dark mode',
    onClick: () => {
      // Handle dark mode toggle
      console.log('Dark mode toggled')
    },
  },
  {
    label: 'Disable sound',
    onClick: () => {
      // Handle sound toggle
      console.log('Sound toggled')
    },
  },
  {
    label: 'Account Settings',
    href: 'https://cow.fi/',
  },
]

const FOOTER_DESCRIPTION =
  'CoW DAO is an open organization of developers, market makers, and community contributors on a mission to protect users from the dangers of DeFi.'

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
// Move this to const file ==========

export function App() {
  useAnalyticsReporter()
  useInitializeUtm()

  const isInjectedWidgetMode = isInjectedWidget()
  const GlobalStyles = GlobalCoWDAOStyles(CoWDAOFonts)

  return (
    <ErrorBoundary>
      <RedirectAnySwapAffectedUsers />
      <DarkModeQueryParamReader />

      <GlobalStyles />

      <styledEl.AppWrapper>
        <URLWarning />
        <InvalidLocalTimeWarning />

        <OrdersPanel />

        {/* Hide header for injected widget mode */}
        {!isInjectedWidgetMode && (
          <MenuBar
            navItems={NAV_ITEMS}
            theme={THEME_MODE}
            productVariant={PRODUCT_VARIANT}
            settingsNavItems={NAV_ITEMS_SETTINGS}
            showGlobalSettings
          />
        )}

        <styledEl.BodyWrapper>
          <TopLevelModals />
          <RoutesApp />
          <styledEl.Marginer />
        </styledEl.BodyWrapper>

        {isInjectedWidgetMode ? (
          <styledEl.MarginerBottom></styledEl.MarginerBottom>
        ) : (
          <Footer
            description={FOOTER_DESCRIPTION}
            navItems={FOOTER_NAV_ITEMS}
            theme={THEME_MODE}
            productVariant={PRODUCT_VARIANT}
            hasTouchFooter
          />
        )}
      </styledEl.AppWrapper>
    </ErrorBoundary>
  )
}
