import iconSocialDiscordSrc from '@cowprotocol/assets/images/icon-social-discord.svg'
import iconSocialForumSrc from '@cowprotocol/assets/images/icon-social-forum.svg'
import iconSocialGithubSrc from '@cowprotocol/assets/images/icon-social-github.svg'
import iconSocialSnapshotSrc from '@cowprotocol/assets/images/icon-social-snapshot.svg'
import iconSocialXSrc from '@cowprotocol/assets/images/icon-social-x.svg'

import { ProductVariant } from '../../pure/ProductLogo'

import { NavItemProps } from './index'

type NavItemChildrenProps = NonNullable<NavItemProps['children']>[number]

export const SOCIAL_LINKS = [
  {
    href: 'https://x.com/CoWSwap',
    label: 'Twitter/X',
    icon: iconSocialXSrc,
    external: true,
    utmContent: 'social-twitter',
  },
  {
    href: 'https://discord.com/invite/cowprotocol',
    label: 'Discord',
    icon: iconSocialDiscordSrc,
    external: true,
    utmContent: 'social-discord',
  },
  {
    href: 'https://github.com/cowprotocol',
    label: 'GitHub',
    icon: iconSocialGithubSrc,
    external: true,
    utmContent: 'social-github',
  },
  {
    href: 'https://forum.cow.fi/',
    label: 'Forum',
    icon: iconSocialForumSrc,
    external: true,
    utmContent: 'social-forum',
  },
  {
    href: 'https://snapshot.org/#/cow.eth',
    label: 'Snapshot',
    icon: iconSocialSnapshotSrc,
    external: true,
    utmContent: 'social-snapshot',
  },
] as const satisfies NavItemChildrenProps[]

export const PRODUCT_LOGO_LINKS = [
  {
    href: 'https://swap.cow.fi/',
    label: 'CoW Swap',
    productVariant: ProductVariant.CowSwap,
    external: true,
    utmContent: 'product-cow-swap',
  },
  {
    href: 'https://cow.fi/',
    label: 'CoW Protocol',
    productVariant: ProductVariant.CowProtocol,
    external: true,
    utmContent: 'product-cow-protocol',
  },
  {
    href: 'https://cow.fi/mev-blocker',
    label: 'MEV Blocker',
    productVariant: ProductVariant.MevBlocker,
    external: true,
    utmContent: 'product-mev-blocker',
  },
  {
    href: 'https://cow.fi/cow-amm',
    label: 'CoW AMM',
    productVariant: ProductVariant.CowAmm,
    external: true,
    utmContent: 'product-cow-amm',
  },
] as const satisfies NavItemChildrenProps[]

export const GLOBAL_FOOTER_DESCRIPTION =
  'CoW DAO is an open collective of developers, market makers, and community contributors on a mission to protect users from the dangers of DeFi.'

const FOOTER_NAV_GROUP_PRODUCTS = {
  label: 'Products',
  children: [
    {
      label: 'CoW Swap',
      href: 'https://cow.fi/cow-swap',
      external: true,
      utmContent: 'footer-products-cow-swap',
    },
    {
      label: 'CoW Protocol',
      href: 'https://cow.fi/cow-protocol',
      external: true,
      utmContent: 'footer-products-cow-protocol',
    },
    { label: 'CoW AMM', href: 'https://cow.fi/cow-amm', external: true, utmContent: 'footer-products-cow-amm' },
    {
      label: 'MEV Blocker',
      href: 'https://cow.fi/mev-blocker',
      external: true,
      utmContent: 'footer-products-mev-blocker',
    },
    {
      label: 'CoW Explorer',
      href: 'https://explorer.cow.fi',
      external: true,
      utmContent: 'footer-products-cow-explorer',
    },
    {
      label: 'CoW Widget',
      href: 'https://cow.fi/widget',
      external: true,
      utmContent: 'footer-products-cow-widget',
    },
  ],
} as const satisfies NavItemProps

const FOOTER_NAV_GROUP_HELP = {
  label: 'Help',
  children: [
    { label: 'Docs', href: 'https://docs.cow.fi/', external: true, utmContent: 'footer-help-docs' },
    {
      label: 'Knowledge Base',
      href: 'https://cow.fi/learn',
      external: true,
      utmContent: 'footer-help-knowledge-base',
    },
    {
      label: 'Report Scams',
      href: 'https://cow.fi/report-scam',
      external: true,
      utmContent: 'footer-help-report-scams',
    },
  ],
} as const satisfies NavItemProps

const FOOTER_NAV_GROUP_MISC = {
  label: 'Misc.',
  children: [
    { label: 'For DAOs', href: 'https://cow.fi/daos', external: true, utmContent: 'footer-misc-for-daos' },
    {
      label: 'Token Charts',
      href: 'https://cow.fi/tokens',
      external: true,
      utmContent: 'footer-misc-token-charts',
    },
  ],
} as const satisfies NavItemProps

export function getAboutFooterNavChildren(): NavItemChildrenProps[] {
  return [
    {
      href: 'https://docs.cow.fi/governance',
      label: 'Governance',
      external: true,
      utmContent: 'footer-about-governance',
    },
    {
      href: 'https://dune.com/cowprotocol/cow-revenue',
      label: 'Revenue',
      external: true,
      utmContent: 'footer-about-revenue',
    },
    { href: 'https://grants.cow.fi/', label: 'Grants', external: true, utmContent: 'footer-about-grants' },
    { href: 'https://cow.fi/careers', label: 'Careers', external: true, utmContent: 'footer-about-careers' },
    {
      href: 'https://cownation.notion.site/CoW-DAO-Brand-Kit-dad6212f182f49d38683e8410bfb37d2',
      label: 'Brand Kit',
      external: true,
      utmContent: 'footer-about-brand-kit',
    },
    { href: 'https://cow.fi/legal', label: 'Legal', external: true, utmContent: 'footer-about-legal' },
    {
      label: 'Bug Bounty',
      href: 'https://immunefi.com/bug-bounty/cowprotocol/information/',
      external: true,
      utmContent: 'footer-misc-bug-bounty',
    },
    {
      label: 'Affiliate Program',
      href: 'https://cow.fi/affiliate-program',
      external: true,
      utmContent: 'footer-about-affiliate-program',
    },
  ]
}

export function getGlobalFooterNavItems(): NavItemProps[] {
  return [
    { label: 'About', children: getAboutFooterNavChildren() },
    FOOTER_NAV_GROUP_PRODUCTS,
    FOOTER_NAV_GROUP_HELP,
    FOOTER_NAV_GROUP_MISC,
  ]
}
