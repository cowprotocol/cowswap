import { siteConfig } from 'const/meta'

export const mainMenu = [
  { id: 0, title: 'Developers', url: '/#developers' },
  { id: 1, title: 'About', url: '/#about' },
  { id: 2, title: 'Community', url: '/#community' },
  { id: 3, title: 'Analytics', url: siteConfig.url.analytics, target: "_blank", rel: "noopener nofollow" },
]

export const footerMenu = [
  {
    id: 0, title: 'CoW Protocol', links: [
      { title: 'About', url: '/' },
      { title: 'Analytics', url: '/' },
      { title: 'Sitemap', url: '/' },
    ]
  },
  {
    id: 1, title: 'Developers', links: [
      { title: 'API Documentation', url: '/' },
      { title: 'GitHub', url: '/' },
      { title: 'Audit', url: '/' },
      { title: 'Bug bounty', url: '/' },
    ]
  },
  {
    id: 2, title: 'Support', links: [
      { title: 'Discord', url: siteConfig.social.discord.url },
      { title: 'Terms of service', url: '/' },
      { title: 'Privacy Policy', url: '/' },
    ]
  },
]

