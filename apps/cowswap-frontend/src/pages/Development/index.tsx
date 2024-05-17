import { MenuBar, MenuItem, ButtonSecondary as Button } from '@cowprotocol/ui'

import IMG_ICON_SETTINGS_GLOBAL from '@cowprotocol/assets/images/settings-global.svg'
import IMG_ICON_BRANDED_DOT_RED from '@cowprotocol/assets/images/icon-branded-dot-red.svg'

const THEME_MODE = 'light'
const PRODUCT_VARIANT = 'cowSwap'

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

export default function Development() {
  return (
    <MenuBar
      navItems={NAV_ITEMS}
      theme={THEME_MODE}
      productVariant={PRODUCT_VARIANT}
      additionalContent={additionalContent}
    />
  )
}
