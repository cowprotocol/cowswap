import { siteConfig } from 'const/meta'
const {url, social} = siteConfig

export const mainMenu = [
  { id: 0, title: 'Documentation', url: url.docs, target: "_blank", rel: "noopener nofollow" },
  { id: 1, title: 'API Docs', url: url.apiDocs},
  // { id: 1, title: 'About', url: '/#about' },
  { id: 2, title: 'Community', url: social.discord.url, target: "_blank", rel: "noopener nofollow" },
  { id: 3, title: 'Analytics', url: url.analytics, target: "_blank", rel: "noopener nofollow" },
]

export const footerMenu = [
  {
    id: 0, title: 'CoW Protocol', links: [
      { title: 'About CoW Protocol', url: '/#about' },
      { title: 'About CowSwap', url: 'https://cowswap.exchange/#/about', target: "_blank" },
      { title: 'CowSwap FAQ', url: 'https://cowswap.exchange/#/faq', target: "_blank" },
      { title: 'Analytics', url: url.analytics, target: "_blank" },
    
      // { title: 'Sitemap', url: '/' },
    ]
  },
  {
    id: 1, title: 'Developers', links: [
      { title: 'Documentation', url: url.docs, target: "_blank" },
      { title: 'API Documentation', url: url.apiDocs, target: "_blank" },
      { title: 'GitHub', url: social.github.url, target: "_blank" },
      { title: 'Audit 1: G0 Group', url: 'https://github.com/gnosis/gp-v2-contracts/raw/main/audits/GnosisProtocolV2May2021.pdf' },
      { title: 'Audit 2: Hacken', url: 'https://github.com/gnosis/gp-v2-contracts/raw/main/audits/%5BCowswap_10122021%5DSCAudit_Report_2.pdf' },
      // { title: 'Bug bounty', url: '/' },
    ]
  },
  {
    id: 2, title: 'Support', links: [
      { title: 'Discord', url: social.discord.url },
      // TODO:
      // { title: 'Terms of service', url: '/' },
      // { title: 'Privacy Policy', url: '/' },
    ]
  },
]

