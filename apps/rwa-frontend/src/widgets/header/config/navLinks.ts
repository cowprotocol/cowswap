export const NAV_LINKS = [
  { href: '/', title: 'Explore' },
  { href: '/portfolio', title: 'Portfolio' },
]

/** CoW Swap is served at the root of the same origin, outside of the basePath that `Link` adds */
export const SWAP_HREF = '/'

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
