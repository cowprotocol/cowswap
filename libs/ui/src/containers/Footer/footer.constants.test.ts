import { getGlobalFooterNavItems, PRODUCT_LOGO_LINKS } from './footer.constants'

import { ProductVariant } from '../../pure/ProductLogo'

describe('footer constants', () => {
  it('lists CoW RWA after CoW Swap and CoW Protocol in the product logos', () => {
    expect(PRODUCT_LOGO_LINKS.map(({ productVariant, href }) => [productVariant, href])).toEqual([
      [ProductVariant.CowSwap, 'https://swap.cow.fi/'],
      [ProductVariant.CowProtocol, 'https://cow.fi/cow-protocol'],
      [ProductVariant.CowRwa, 'https://swap.cow.fi/rwa'],
    ])
  })

  it('lists CoW RWA under Products as an external link', () => {
    const products = getGlobalFooterNavItems().find(({ label }) => label === 'Products')

    expect(products?.children?.at(-1)).toEqual({
      label: 'CoW RWA',
      href: 'https://swap.cow.fi/rwa',
      external: true,
      utmContent: 'footer-products-cow-rwa',
    })
  })
})
