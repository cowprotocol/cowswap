import { CustomLinkProps } from '@/components/CustomLink'
import { CONFIG } from 'const/meta'
const { url, social } = CONFIG

export interface FooterLinkGroup {
  label: string
  links: CustomLinkProps[]
}

export const HEADER_LINKS: CustomLinkProps[] = [
  { label: 'DAOs', url: url.daos },
  { label: 'Learn', url: '/learn' },
  { label: 'Widget', url: url.widget },
  { label: 'CoW AMM', url: url.cowamm },
  { label: 'MEV Blocker', url: url.mevBlocker, type: 'external', utmContent: 'header-link-mevblocker' },
]

const utmContent = 'footer-link'

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    label: 'Overview',
    links: [
      { label: 'For DAOs', url: url.daos },
      { label: 'Widget', url: url.widget },
      { label: 'Widget Terms and Conditions', url: url.widgetTnC },
      { label: 'CoW AMM', url: url.cowamm },
      { label: 'MEV Blocker', url: url.mevBlocker, type: 'external' },
      { label: 'Careers', url: '/careers' },
      { label: 'Refer-to-Earn', url: '/careers/refer-to-earn' },
      { label: 'Grants', url: url.grants, type: 'external' },
      { label: 'Explorer', url: url.explorer, type: 'external', utmContent },
    ],
  },
  {
    label: 'CoW Protocol',
    links: [
      { label: 'About', url: '/#about' },
      { label: 'Learn', url: '/learn' },
      { label: 'CoW Swap', url: 'https://swap.cow.fi/#/about', type: 'external', utmContent },
      { label: 'Analytics', url: url.analytics, type: 'external' },
      { label: 'CoW Swap FAQ', url: 'https://swap.cow.fi/#/faq', type: 'external', utmContent },
      { label: 'Tokens', url: '/tokens' },
      {
        label: 'Brand Kit',
        url: 'https://cownation.notion.site/CoW-DAO-Brand-Kit-fe70d51a39df4229b7912cb7af3eb320',
        type: 'external',
      },
      {
        label: 'Terms and Conditions',
        url: 'https://swap.cow.fi/#/terms-and-conditions',
        type: 'external',
        utmContent,
      },
      { label: 'Privacy Policy', url: 'https://swap.cow.fi/#/privacy-policy', type: 'external', utmContent },
      { label: 'Cookie Policy', url: 'https://swap.cow.fi/#/cookie-policy', type: 'external', utmContent },
    ],
  },
  {
    label: 'Developers',
    links: [
      { label: 'Documentation', url: url.docs, type: 'external', utmContent },
      { label: 'API Documentation', url: url.apiDocs, type: 'external' },
      { label: 'GitHub', url: social.github.url, type: 'external' },
      {
        label: 'Audit 1: G0 Group',
        url: 'https://github.com/gnosis/gp-v2-contracts/raw/main/audits/GnosisProtocolV2May2021.pdf',
        type: 'external_untrusted',
      },
      {
        label: 'Audit 2: Hacken',
        url: 'https://github.com/gnosis/gp-v2-contracts/raw/main/audits/%5BCowswap_10122021%5DSCAudit_Report_2.pdf',
        type: 'external_untrusted',
      },
    ],
  },
  {
    label: 'CoWmunity',
    links: [
      { label: 'Governance', url: 'https://snapshot.org/#/cow.eth', type: 'external' },
      { label: 'Forum', url: 'https://forum.cow.fi', type: 'external' },
      { label: 'Blog', url: 'https://medium.com/@cow-protocol', type: 'external' },
      { label: 'Discord', url: social.discord.url, type: 'external_untrusted' },
      { label: 'Security portal', url: url.securityPortal, type: 'external_untrusted' },
    ],
  },
]
