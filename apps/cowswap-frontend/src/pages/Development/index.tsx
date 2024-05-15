import { MenuBar, MenuItem } from '@cowprotocol/ui'

import IMG_ICON_SETTINGS_GLOBAL from '@cowprotocol/assets/images/settings-global.svg'

const THEME_MODE = 'light'
const PRODUCT_VARIANT = 'cowSwap'

const NAV_ITEMS: MenuItem[] = [
  {
    href: '#',
    label: 'Trade',
    children: [
      { href: '#', label: 'Swap', description: 'Trade tokens' },
      { href: '#', label: 'Limit order' },
      { href: '#', label: 'TWAP' },
    ],
  },
  { href: '#', label: 'Account' },
  { href: '#', label: 'FAQ' },
  {
    type: 'dropdown',
    label: 'More',
    children: [
      {
        href: '#',
        label: 'Documentation',
        description: 'Learn more about CoW',
        icon: IMG_ICON_SETTINGS_GLOBAL,
        children: [
          { href: '#', label: 'Getting started', description: 'Start using CoW' },
          { href: '#', label: 'API', description: 'Integrate with CoW' },
          { href: '#', label: 'Support', description: 'Get help' },
        ],
      },
      { href: '#', label: 'API', description: 'Integrate with CoW', icon: IMG_ICON_SETTINGS_GLOBAL },
      { href: '#', label: 'Support', description: 'Get help', icon: IMG_ICON_SETTINGS_GLOBAL },
      { href: '#', label: 'Trade on CoW Swap', isButton: true },
    ],
  },
]

export default function Development() {
  return <MenuBar navItems={NAV_ITEMS} theme={THEME_MODE} productVariant={PRODUCT_VARIANT} />
}
