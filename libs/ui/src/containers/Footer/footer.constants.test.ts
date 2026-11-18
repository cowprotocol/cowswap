import { getGlobalFooterNavItems, getProductLogoLinks } from './footer.constants'

import { ProductVariant } from '../../pure/ProductLogo'

describe('footer constants', () => {
  it('lists CoW RWA after CoW Swap and CoW Protocol in the product logos when RWA is enabled', () => {
    expect(getProductLogoLinks(true).map(({ productVariant, href }) => [productVariant, href])).toEqual([
      [ProductVariant.CowSwap, 'https://swap.cow.fi/'],
      [ProductVariant.CowProtocol, 'https://cow.fi/cow-protocol'],
      [ProductVariant.CowRwa, 'https://swap.cow.fi/rwa'],
    ])
  })

  it('omits CoW RWA from the product logos when RWA is disabled', () => {
    expect(getProductLogoLinks(false).map(({ productVariant }) => productVariant)).toEqual([
      ProductVariant.CowSwap,
      ProductVariant.CowProtocol,
    ])
  })

  it('lists CoW RWA under Products as an external link when RWA is enabled', () => {
    const products = getGlobalFooterNavItems(true).find(({ label }) => label === 'Products')

    expect(products?.children?.find(({ label }) => label === 'CoW RWA')).toEqual({
      label: 'CoW RWA',
      href: 'https://swap.cow.fi/rwa',
      external: true,
      utmContent: 'footer-products-cow-rwa',
    })
  })

  it('omits CoW RWA from Products by default', () => {
    const products = getGlobalFooterNavItems().find(({ label }) => label === 'Products')

    expect(products?.children?.map(({ label }) => label)).not.toContain('CoW RWA')
  })
})
