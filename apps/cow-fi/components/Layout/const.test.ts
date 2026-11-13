import { getNavAdditionalButtons, getNavItems } from './const'

jest.mock('@cowprotocol/analytics', () => ({
  initGtmWithConsent: () => ({
    sendEvent: jest.fn(),
  }),
}))

jest.mock('src/common/analytics/types', () => ({
  CowFiCategory: {
    NAVIGATION: 'navigation',
  },
}))

jest.mock('@cowprotocol/ui', () => ({
  Color: {
    cowamm_dark_green: '#000',
    cowamm_green: '#111',
  },
  ProductVariant: {
    CowDao: 'CowDao',
  },
  UI: {
    COLOR_BLUE_300_PRIMARY: '--blue300',
    COLOR_BLUE_900_PRIMARY: '--blue900',
  },
}))

function getMoreItemLabels(isSolversEnabled: boolean): string[] {
  const productsItem = getNavItems(isSolversEnabled).find((item) => item.label === 'Products')
  const moreItem = productsItem?.children?.find((item) => item.label === 'More')

  if (!moreItem?.children) {
    throw new Error('Missing More menu item')
  }

  return moreItem.children.map((child) => child.label).filter((label): label is string => label !== undefined)
}

describe('getNavItems', () => {
  it('hides solvers menu item when the solvers flag is disabled', () => {
    expect(getMoreItemLabels(false)).not.toContain('Solvers')
  })

  it('shows solvers menu item when the solvers flag is enabled', () => {
    expect(getMoreItemLabels(true)).toContain('Solvers')
  })
})

describe('getNavAdditionalButtons', () => {
  it('does not include the LP on CoW AMM button', () => {
    const labels = getNavAdditionalButtons('/').map((button) => button.label)

    expect(labels).not.toContain('LP on CoW AMM')
    expect(labels).toContain('Trade on CoW Swap')
  })

  it('opens CoW Swap on Ethereum from regular pages', () => {
    expect(getNavAdditionalButtons('/cow-protocol')[0].href).toBe('https://swap.cow.fi/#/1/swap/USDC/COW')
  })

  it('opens CoW Swap on Solana from the Solana page', () => {
    expect(getNavAdditionalButtons('/solana')[0].href).toBe('https://swap.cow.fi/#/1000000001/swap/SOL/USDC')
  })

  it('does not treat other paths starting with solana as the Solana page', () => {
    expect(getNavAdditionalButtons('/solana-faq')[0].href).toBe('https://swap.cow.fi/#/1/swap/USDC/COW')
  })
})
