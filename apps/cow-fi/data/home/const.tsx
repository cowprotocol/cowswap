import { ProductVariant } from '@cowprotocol/ui'

import IMG_GREEN_WAVES from '@cowprotocol/assets/images/image-green-waves.svg'
import IMG_COINS from '@cowprotocol/assets/images/image-coins.svg'
import IMG_BITS from '@cowprotocol/assets/images/image-bits.svg'
import IMG_TUBE from '@cowprotocol/assets/images/image-tube.svg'

import IMG_DISCORD from '@cowprotocol/assets/images/image-discord.svg'
import IMG_FORUM from '@cowprotocol/assets/images/image-forum.svg'
import IMG_SNAPSHOT from '@cowprotocol/assets/images/image-snapshot.svg'

export const PRODUCT_LIST = [
  {
    title: 'CoW Protocol',
    description: 'Open-source, permissionless DEX aggregation protocol',
    linkHref: '/cow-protocol',
    linkText: 'Start building',
    linkEvent: 'click-start-building',
    bgColor: '#490072',
    textColor: '#F996EE',
    descriptionColor: '#F996EE',
    linkBgColor: '#F996EE',
    linkColor: '#490072',
    productVariant: ProductVariant.CowDao,
    iconImage: IMG_BITS,
  },
  {
    title: 'CoW Swap',
    description: 'The DEX that lets you do what you want',
    linkHref: 'https://swap.cow.fi/#/1/swap/USDC/COW',
    linkText: 'Start trading',
    linkEvent: 'click-trade-on-cow-swap',
    linkExternal: true,
    linkUtmContent: 'home-page-trade-on-cow-swap',
    bgColor: '#65D9FF',
    textColor: '#012F7A',
    descriptionColor: '#012F7A',
    linkBgColor: '#012F7A',
    linkColor: '#65D9FF',
    productVariant: ProductVariant.CowDao,
    iconImage: IMG_GREEN_WAVES,
  },
  {
    title: 'CoW AMM',
    description: 'The first MEV-capturing AMM',
    linkHref: '/cow-amm',
    linkText: 'Deposit liquidity',
    linkEvent: 'click-deploy-liquidity',
    bgColor: '#194D06',
    textColor: '#BCEC79',
    descriptionColor: '#BCEC79',
    linkBgColor: '#BCEC79',
    linkColor: '#194D06',
    productVariant: ProductVariant.CowDao,
    iconImage: IMG_COINS,
  },
  {
    title: 'MEV Blocker',
    description: 'The best MEV protection RPC under the sun',
    linkHref: '/mev-blocker',
    linkText: 'Get protected',
    linkEvent: 'click-get-protected',
    bgColor: '#FEE7CF',
    textColor: '#EC4612',
    descriptionColor: '#EC4612',
    linkBgColor: '#EC4612',
    linkColor: '#FEE7CF',
    productVariant: ProductVariant.MevBlocker,
    iconImage: IMG_TUBE,
  },
]

export const CHANNEL_LIST = [
  {
    title: 'Discord',
    href: 'https://discord.com/invite/cowprotocol?utm_source=cow.fi&utm_medium=web&utm_content=link',
    linkEvent: 'click-discord',
    iconColor: '#FDADA3',
    textColor: '#23191A',
    iconImage: IMG_DISCORD,
  },
  {
    title: 'Forum',
    href: 'https://forum.cow.fi/?utm_source=cow.fi&utm_medium=web&utm_content=link',
    linkEvent: 'click-forum',
    iconColor: '#1E5C06',
    textColor: '#FFF8F7',
    iconImage: IMG_FORUM,
  },
  {
    title: 'Snapshot',
    href: 'https://snapshot.org/#/cow.eth?utm_source=cow.fi&utm_medium=web&utm_content=link',
    linkEvent: 'click-snapshot',
    iconColor: '#710408',
    textColor: '#FFF8F7',
    iconImage: IMG_SNAPSHOT,
  },
]
