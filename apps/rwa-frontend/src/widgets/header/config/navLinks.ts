export const NAV_LINKS = [
  { href: '/', title: 'Explore' },
  { href: '/portfolio', title: 'Portfolio' },
]

export const MORE_SECTIONS = [
  {
    title: 'Legal',
    links: [
      { href: 'https://cow.fi/legal/cowswap-terms', title: 'Terms and Conditions' },
      { href: 'https://cow.fi/legal/cowswap-privacy-policy', title: 'Privacy Policy' },
      { href: 'https://cow.fi/legal/cowswap-cookie-policy', title: 'Cookie Policy' },
    ],
  },
]

export function isNavLinkActive(href: string, pathname: string): boolean {
  return href === '/' ? pathname === '/' || pathname.startsWith('/asset/') : pathname.startsWith(href)
}
