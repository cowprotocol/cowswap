import { render, screen } from '@testing-library/react'

import { AssetBackLink } from './AssetBackLink'

const mockSearchParams = { current: new URLSearchParams() }

jest.mock('next/navigation', () => ({ useSearchParams: () => mockSearchParams.current }))

describe('AssetBackLink', () => {
  it('returns to the portfolio that opened the asset', () => {
    mockSearchParams.current = new URLSearchParams('from=portfolio')
    render(<AssetBackLink />)

    expect(screen.getByRole('link', { name: 'Portfolio' }).getAttribute('href')).toBe('/portfolio')
  })

  it.each(['', 'from=elsewhere'])('returns to Explore for "%s"', (search) => {
    mockSearchParams.current = new URLSearchParams(search)
    render(<AssetBackLink />)

    expect(screen.getByRole('link', { name: 'Explore' }).getAttribute('href')).toBe('/')
  })
})
