import { render, screen } from '@testing-library/react'

jest.mock('@cowprotocol/ui', () => ({
  Font: {
    family: 'studiofeixen',
    weight: {
      bold: 700,
    },
  },
  ProductVariant: {
    CowSwap: 'cowSwap',
  },
  ProductLogo: () => <svg data-testid="product-logo" />,
}))

import { ConfiguratorBrandHeader } from './ConfiguratorBrandHeader'

describe('ConfiguratorBrandHeader', () => {
  it('renders the CoW Widget heading with the shared product logo', () => {
    render(<ConfiguratorBrandHeader title="CoW Widget" themeMode="light" />)

    expect(screen.getByRole('heading', { name: 'CoW Widget' })).not.toBeNull()
    expect(screen.getByTestId('product-logo')).not.toBeNull()
  })
})
