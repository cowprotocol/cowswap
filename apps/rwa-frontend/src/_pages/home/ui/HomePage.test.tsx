import { render, screen } from '@testing-library/react'

import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders the heading and the search', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Tokenized stocks' })).toBeTruthy()
    expect(screen.getByRole('searchbox', { name: 'Search assets' })).toBeTruthy()
  })
})
