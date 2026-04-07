import { getNavItems } from './const'

jest.mock('@cowprotocol/analytics', () => ({
  initGtm: () => ({
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
