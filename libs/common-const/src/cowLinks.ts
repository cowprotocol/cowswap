export interface CowLink {
  label: string
  href: string
  utmContent?: string
}

export interface CowLinkGroup {
  label: string
  links: CowLink[]
}

export type CowProductId = 'cowSwap' | 'cowProtocol' | 'cowRwa'

export type CowSocialId = 'x' | 'discord' | 'github' | 'forum' | 'snapshot'

export const COW_DAO_DESCRIPTION =
  'CoW DAO is an open collective of developers, market makers, and community contributors on a mission to protect users from the dangers of DeFi.'

export const COW_DAO_LINK: CowLink = { label: 'CoW DAO', href: 'https://cow.fi/' }

export const COWSWAP_COOKIE_POLICY_LINK = 'https://cow.fi/legal/cowswap-cookie-policy'

export const COW_RWA_URL = 'https://swap.cow.fi/rwa'

/**
 * CoW products of the header products menu and of the footer logo row, in display order
 */
export const COW_PRODUCT_LINKS: (CowLink & { id: CowProductId })[] = [
  { id: 'cowSwap', label: 'CoW Swap', href: 'https://swap.cow.fi/' },
  { id: 'cowProtocol', label: 'CoW Protocol', href: 'https://cow.fi/cow-protocol' },
  { id: 'cowRwa', label: 'CoW RWA', href: COW_RWA_URL },
]

export const COW_SOCIAL_LINKS: (CowLink & { id: CowSocialId })[] = [
  { id: 'x', label: 'Twitter/X', href: 'https://x.com/CoWSwap', utmContent: 'social-twitter' },
  { id: 'discord', label: 'Discord', href: 'https://discord.com/invite/cowprotocol', utmContent: 'social-discord' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/cowprotocol', utmContent: 'social-github' },
  { id: 'forum', label: 'Forum', href: 'https://forum.cow.fi/', utmContent: 'social-forum' },
  { id: 'snapshot', label: 'Snapshot', href: 'https://snapshot.org/#/cow.eth', utmContent: 'social-snapshot' },
]

export const COW_FOOTER_ABOUT_LINKS: CowLink[] = [
  { label: 'Governance', href: 'https://docs.cow.fi/governance', utmContent: 'footer-about-governance' },
  {
    label: 'Revenue',
    href: 'https://tokenterminal.com/explorer/projects/cow-protocol/metrics/revenue',
    utmContent: 'footer-about-revenue',
  },
  { label: 'Grants', href: 'https://grants.cow.fi/', utmContent: 'footer-about-grants' },
  { label: 'Careers', href: 'https://cow.fi/careers', utmContent: 'footer-about-careers' },
  {
    label: 'Brand Kit',
    href: 'https://cownation.notion.site/CoW-DAO-Brand-Kit-dad6212f182f49d38683e8410bfb37d2',
    utmContent: 'footer-about-brand-kit',
  },
  { label: 'Legal', href: 'https://cow.fi/legal', utmContent: 'footer-about-legal' },
  {
    label: 'Bug Bounty',
    href: 'https://immunefi.com/bug-bounty/cowprotocol/information/',
    utmContent: 'footer-misc-bug-bounty',
  },
  {
    label: 'Affiliate Program',
    href: 'https://cow.fi/affiliate-program',
    utmContent: 'footer-about-affiliate-program',
  },
]

export const COW_FOOTER_NAV_GROUPS: CowLinkGroup[] = [
  { label: 'About', links: COW_FOOTER_ABOUT_LINKS },
  {
    label: 'Products',
    links: [
      { label: 'CoW Swap', href: 'https://cow.fi/cow-swap', utmContent: 'footer-products-cow-swap' },
      { label: 'CoW Protocol', href: 'https://cow.fi/cow-protocol', utmContent: 'footer-products-cow-protocol' },
      { label: 'CoW Explorer', href: 'https://explorer.cow.fi', utmContent: 'footer-products-cow-explorer' },
      { label: 'CoW Widget', href: 'https://cow.fi/widget', utmContent: 'footer-products-cow-widget' },
      { label: 'CoW RWA', href: COW_RWA_URL, utmContent: 'footer-products-cow-rwa' },
    ],
  },
  {
    label: 'Help',
    links: [
      { label: 'Docs', href: 'https://docs.cow.fi/', utmContent: 'footer-help-docs' },
      { label: 'Knowledge Base', href: 'https://cow.fi/learn', utmContent: 'footer-help-knowledge-base' },
      { label: 'Resources', href: 'https://cow.fi/resources', utmContent: 'footer-help-resources' },
      { label: 'Report Scams', href: 'https://cow.fi/report-scam', utmContent: 'footer-help-report-scams' },
    ],
  },
  {
    label: 'Misc.',
    links: [
      { label: 'For DAOs', href: 'https://cow.fi/daos', utmContent: 'footer-misc-for-daos' },
      { label: 'Token Charts', href: 'https://cow.fi/tokens', utmContent: 'footer-misc-token-charts' },
    ],
  },
]
