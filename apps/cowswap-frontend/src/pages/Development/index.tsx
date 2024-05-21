import {
  MenuBar,
  MenuItem,
  ButtonSecondary as Button,
  Footer,
  ProductVariant,
  GlobalCoWDAOStyles,
} from '@cowprotocol/ui'

import { FeatureGuard } from 'common/containers/FeatureGuard'
import { FortuneWidget } from 'modules/fortune/containers/FortuneWidget'
import AppziButton from 'legacy/components/AppziButton'

import IMG_ICON_SETTINGS_GLOBAL from '@cowprotocol/assets/images/settings-global.svg'
import IMG_ICON_BRANDED_DOT_RED from '@cowprotocol/assets/images/icon-branded-dot-red.svg'

import { isInjectedWidget } from '@cowprotocol/common-utils'

const THEME_MODE = 'light'
const PRODUCT_VARIANT = ProductVariant.CowSwap

const NAV_ITEMS: MenuItem[] = [
  {
    href: '#',
    label: 'Trade',
    children: [
      { icon: IMG_ICON_BRANDED_DOT_RED, href: '#', label: 'Swap', description: 'Trade tokens' },
      { icon: IMG_ICON_BRANDED_DOT_RED, href: '#', label: 'Limit order', description: 'Set your own price' },
      {
        icon: IMG_ICON_BRANDED_DOT_RED,
        href: 'https://cow.fi/',
        label: 'TWAP',
        description: 'Place orders with a time-weighted average price',
      },
    ],
  },
  { href: 'https://cow.fi/', label: 'Account' },
  { href: 'https://cow.fi/', label: 'FAQ' },
  {
    type: 'dropdown',
    label: 'More',
    children: [
      {
        href: 'https://cow.fi/',
        label: 'Documentation',
        description: 'Learn more about CoW',
        icon: IMG_ICON_SETTINGS_GLOBAL,
        children: [
          { href: 'https://cow.fi/cow-amm', label: 'Getting started', description: 'Start using CoW' },
          { href: 'https://cow.fi/cow-amm', label: 'API', description: 'Integrate with CoW' },
          { href: 'https://cow.fi/', label: 'Support', description: 'Get help' },
        ],
      },
      { href: 'https://cow.fi/', label: 'API', description: 'Integrate with CoW', icon: IMG_ICON_SETTINGS_GLOBAL },
      { href: 'https://cow.fi/', label: 'Support', description: 'Get help', icon: IMG_ICON_SETTINGS_GLOBAL },
      { href: 'https://cow.fi/', label: 'Trade on CoW Swap', isButton: true },
    ],
  },
]

const additionalContent = (
  <>
    <Button>Button 1</Button>
    <Button>Button 2</Button>
  </>
)

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

export default function Development() {
  const isInjectedWidgetMode = isInjectedWidget()

  // Don't render the menu bar and footer in injected widget mode
  if (isInjectedWidgetMode) {
    return null
  }

  return (
    <>
      {/* Temp location for GlobalStyle */}
      <GlobalCoWDAOStyles />

      <MenuBar
        navItems={NAV_ITEMS}
        theme={THEME_MODE}
        productVariant={PRODUCT_VARIANT}
        additionalContent={additionalContent}
      />

      <Footer
        description={FOOTER_DESCRIPTION}
        navItems={FOOTER_NAV_ITEMS}
        theme={THEME_MODE}
        productVariant={PRODUCT_VARIANT}
        additionalFooterContent={
          <>
            {/* <FeatureGuard featureFlag="cowFortuneEnabled"> */}
            <FortuneWidget />
            {/* </FeatureGuard> */}
            <AppziButton />
          </>
        }
      />
    </>
  )
}
