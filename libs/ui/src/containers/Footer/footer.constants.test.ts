import { getGlobalFooterNavItems, getProductLogoLinks } from './footer.constants'

import { ProductVariant } from '../../pure/ProductLogo'

describe('footer constants', () => {
  it('lists the CoW Swap and CoW Protocol product logos', () => {
    expect(getProductLogoLinks().map(({ productVariant, href }) => [productVariant, href])).toEqual([
      [ProductVariant.CowSwap, 'https://swap.cow.fi/'],
      [ProductVariant.CowProtocol, 'https://cow.fi/cow-protocol'],
    ])
  })

  it('lists Stocks under Products as an external link when RWA is enabled', () => {
    const products = getGlobalFooterNavItems(true).find(({ label }) => label === 'Products')

    expect(products?.children?.find(({ label }) => label === 'Stocks')).toEqual({
      label: 'Stocks',
      href: 'https://swap.cow.fi/rwa',
      external: true,
      utmContent: 'footer-products-cow-rwa',
    })
  })

  it('omits Stocks from Products by default', () => {
    const products = getGlobalFooterNavItems().find(({ label }) => label === 'Products')

    expect(products?.children?.map(({ label }) => label)).not.toContain('Stocks')
  })
})
